import { getApiBase } from "../../../config/apiBase";

function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function postAssistantChat(body) {
  const url = `${getApiBase()}/chat/assistant`;

  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error(
      "Too many messages. Please wait a moment before trying again.",
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.error || errBody.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error("Assistant did not return a successful response.");
  }
  return data;
}

export async function fetchAssistantSession(sessionId) {
  const url = `${getApiBase()}/chat/assistant/session/${encodeURIComponent(sessionId)}`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function clearAssistantSession(sessionId) {
  const url = `${getApiBase()}/chat/assistant/session/${encodeURIComponent(sessionId)}`;

  await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
