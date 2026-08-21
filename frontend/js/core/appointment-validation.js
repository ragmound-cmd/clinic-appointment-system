import { APPOINTMENT_RULES } from "./config.js";
import { TIMEZONE } from "./constants.js";

function result(valid, field = "", code = "", message = "") { return { valid, field, code, message }; }

export function isValidCurrentWeekday(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number); const date = new Date(year, month - 1, day);
  const current = new Intl.DateTimeFormat("en", { timeZone: TIMEZONE, year: "numeric", month: "numeric" }).formatToParts(new Date());
  const currentYear = Number(current.find((part) => part.type === "year")?.value);
  const currentMonth = Number(current.find((part) => part.type === "month")?.value);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date.getDay() > 0 && date.getDay() < 6 && year === currentYear && month === currentMonth;
}

export function validateAppointment({ doctor, visitType, date, time } = {}) {
  if (!doctor) return result(false, "doctor", "INVALID_DOCTOR", "Please select a valid doctor.");
  if (!APPOINTMENT_RULES.visitTypes.includes(visitType)) return result(false, "visitType", "INVALID_VISIT_TYPE", "Please select a valid visit type.");
  if (!isValidCurrentWeekday(date)) return result(false, "date", "INVALID_DATE", "Please select a weekday in the current month.");
  if (!APPOINTMENT_RULES.timeSlots.includes(time)) return result(false, "time", "INVALID_TIME_SLOT", "Please select a valid appointment time.");
  return result(true);
}

export function validateAppointmentId(value) { return typeof value === "string" && /^[a-zA-Z0-9-]{1,160}$/.test(value); }

export function validateDoctorId(value) { return typeof value === "string" && /^[a-zA-Z0-9-]{1,160}$/.test(value); }
