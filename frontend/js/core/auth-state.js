import { AUTH_STATES } from "./constants.js";

let state = AUTH_STATES.UNAUTHENTICATED;
let currentUser = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener({ state, currentUser }));
}

export function getAuthState() {
  return { state, currentUser };
}

export function setAuthState(nextState, user = currentUser) {
  state = nextState;
  currentUser = user;
  notify();
}

export function subscribeToAuthState(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export { AUTH_STATES };
