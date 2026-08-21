import { API_PREFIX, APPOINTMENT_TIME_SLOTS, TIMEZONE, VISIT_TYPES } from "./constants.js";

export { APPOINTMENT_STATUSES, AUTH_STATES, USER_ROLES } from "./constants.js";

export const APPOINTMENT_RULES = Object.freeze({
  visitTypes: Object.freeze(Object.values(VISIT_TYPES)),
  timeSlots: APPOINTMENT_TIME_SLOTS,
  timezone: TIMEZONE,
});

export const API_CONFIG = Object.freeze({
  baseUrl: window.CAREPULSE_API_BASE_URL || `http://localhost:5000${API_PREFIX}`,
});
export const AUTH_RULES = Object.freeze({ passwordMinimumLength: 8 });
