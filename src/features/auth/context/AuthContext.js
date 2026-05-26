import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API = (
  process.env.REACT_APP_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/$/, "");

async function readApiResponse(res, fallbackMessage) {
  const text = await res.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || fallbackMessage);
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);

  /** Fetch current user from the backend using the stored token */
  const fetchMe = useCallback(async (storedToken) => {
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch {
      // Backend unreachable — treat as signed out for UI until /auth/me succeeds
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe(token);
  }, [fetchMe, token]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await readApiResponse(res, "Login failed");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async ({ email, username, password, firstName, lastName }) => {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          firstName,
          lastName,
        }),
      });
      const data = await readApiResponse(res, "Registration failed");
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload) => {
      const userId = user?._id || user?.id;
      if (!token || !userId) {
        throw new Error("You must be signed in to update your profile");
      }
      const { updateProfile: updateProfileApi } = await import(
        "../../profile/services/profileApi"
      );
      const data = await updateProfileApi(token, userId, payload);
      setUser(data.user);
      return data.user;
    },
    [token, user],
  );

  const uploadAvatar = useCallback(
    async (imageBase64) => {
      const userId = user?._id || user?.id;
      if (!token || !userId) {
        throw new Error("You must be signed in to upload a profile picture");
      }
      setAvatarPreview(imageBase64);
      try {
        const { uploadProfileAvatar } = await import(
          "../../profile/services/profileApi"
        );
        const data = await uploadProfileAvatar(token, userId, imageBase64);
        setUser(data.user);
        return data.user;
      } finally {
        setAvatarPreview(null);
      }
    },
    [token, user],
  );

  const isAuthenticated = !loading && Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        avatarPreview,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
