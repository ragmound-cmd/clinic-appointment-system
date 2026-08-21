export const USER_ROLES = Object.freeze({
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
});

export const VISIT_TYPES = Object.freeze({
  ONLINE_CONSULTATION: "online consultation",
  PHYSICAL_CONSULTATION: "physical consultation",
});

export const APPOINTMENT_STATUSES = Object.freeze({
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
});

export const AUTH_STATES = Object.freeze({
  UNAUTHENTICATED: "unauthenticated",
  AUTHENTICATING: "authenticating",
  AUTHENTICATED: "authenticated",
  LOGGING_OUT: "logging-out",
  ERROR: "authentication-error",
});

export const APPOINTMENT_TIME_SLOTS = Object.freeze([
  "09:00",
  "11:00",
  "13:00",
  "15:00",
  "17:00",
]);

export const TIMEZONE = "Africa/Lagos";
export const API_PREFIX = "/api/v1";
