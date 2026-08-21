import { API_CONFIG } from "./config.js";

const TOKEN_KEY = "carepulse-access-token";

function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function normalizeError(error) {
  if (error?.type) return error;
  return { type: "network", status: 0, code: "NETWORK_ERROR", message: "Unable to reach the service.", cause: error };
}

async function request(path, options = {}) {
  try {
    const token = getToken();
    const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      ...options,
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
      body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
    });
    let data = null;
    try { data = await response.json(); } catch { /* Empty or non-JSON response. */ }
    if (!response.ok) throw { type: "http", status: response.status, code: data?.error?.code || data?.code || `HTTP_${response.status}`, message: data?.error?.message || data?.message || "The request could not be completed." };
    return data;
  } catch (error) { throw normalizeError(error); }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
