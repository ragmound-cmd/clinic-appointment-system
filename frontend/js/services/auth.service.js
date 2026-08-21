import { apiClient } from "../core/api-client.js";
import {
  AUTH_STATES,
  getAuthState,
  setAuthState,
} from "../core/auth-state.js";

const TOKEN_KEY = "carepulse-access-token";

function saveToken(token) {
  try { if (token) sessionStorage.setItem(TOKEN_KEY, token); } catch { /* Session storage is optional. */ }
}

function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* Session storage is optional. */ }
}

function userFromResponse(response) {
  if (response?.token) saveToken(response.token);
  return response?.user || null;
}

export async function register(input) {
  setAuthState(AUTH_STATES.AUTHENTICATING);
  try {
    const user = userFromResponse(await apiClient.post("/auth/register", input));
    setAuthState(AUTH_STATES.AUTHENTICATED, user);
    return user;
  } catch (error) {
    setAuthState(AUTH_STATES.ERROR, null);
    throw error;
  }
}

export async function login(input) {
  setAuthState(AUTH_STATES.AUTHENTICATING);
  try {
    const user = userFromResponse(await apiClient.post("/auth/login", input));
    setAuthState(AUTH_STATES.AUTHENTICATED, user);
    return user;
  } catch (error) {
    setAuthState(AUTH_STATES.ERROR, null);
    throw error;
  }
}

export async function logout() {
  setAuthState(AUTH_STATES.LOGGING_OUT);
  try { await apiClient.post("/auth/logout"); } finally { clearToken(); }
  setAuthState(AUTH_STATES.UNAUTHENTICATED, null);
}

export async function getCurrentUser() {
  let user = null;
  try { user = (await apiClient.get("/auth/me"))?.user || null; }
  catch (error) { clearToken(); if (error.status !== 401) throw error; }
  setAuthState(user ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED, user);
  return user;
}

export function isAuthenticated() {
  return getAuthState().state === AUTH_STATES.AUTHENTICATED;
}
