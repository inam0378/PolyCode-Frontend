const API = (
  process.env.REACT_APP_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/$/, "");

async function readResponse(res, fallbackMessage) {
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

export async function updateProfile(token, userId, payload) {
  const res = await fetch(`${API}/auth/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return readResponse(res, "Could not update profile");
}

export async function uploadProfileAvatar(token, userId, imageBase64) {
  const res = await fetch(`${API}/auth/user/${userId}/avatar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });
  return readResponse(res, "Could not upload profile picture");
}
