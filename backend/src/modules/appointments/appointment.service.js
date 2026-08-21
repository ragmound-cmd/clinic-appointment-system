import { ApiError } from "../../utils/api-error.js";
import { APPOINTMENT_STATUSES, VISIT_TYPES } from "../../config/constants.js";
import { findAvailabilityById, findDoctorById } from "../doctors/doctor.repository.js";
import { findAppointmentById, findAppointmentsByPatient, findDoctorConflict, createAppointment as persistAppointment } from "./appointment.repository.js";

export async function createAppointment({ patientId, doctorId, availabilityId, appointmentDate, startTime, visitType }) {
  if (!patientId) throw new ApiError(401, "A patient account is required.", "UNAUTHENTICATED");
  if (!Object.values(VISIT_TYPES).includes(visitType)) throw new ApiError(422, "Invalid visit type.", "INVALID_VISIT_TYPE");
  const doctor = await findDoctorById(doctorId);
  if (!doctor || doctor.status !== "ACTIVE") throw new ApiError(404, "Doctor not found.", "DOCTOR_NOT_FOUND");
  const availability = await findAvailabilityById(availabilityId);
  if (!availability || !availability.isActive || String(availability.doctorId) !== String(doctorId)) throw new ApiError(422, "The selected availability is invalid.", "INVALID_AVAILABILITY");
  const weekday = ((new Date(`${appointmentDate}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
  if (weekday !== availability.dayOfWeek || startTime < availability.startTime || startTime >= availability.endTime) throw new ApiError(422, "The selected time is outside the doctor's availability.", "OUTSIDE_AVAILABILITY");
  const conflict = await findDoctorConflict({ doctorId, appointmentDate, startTime });
  if (conflict) throw new ApiError(409, "The selected appointment slot is no longer available.", "SLOT_UNAVAILABLE");
  try {
    return await persistAppointment({ patientId, doctorId, availabilityId, appointmentDate, startTime, visitType, status: APPOINTMENT_STATUSES.CONFIRMED });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, "The selected appointment slot is no longer available.", "SLOT_UNAVAILABLE");
    throw error;
  }
}

export async function getAppointment(id, user) {
  const appointment = await findAppointmentById(id);
  if (!appointment) throw new ApiError(404, "Appointment not found.", "APPOINTMENT_NOT_FOUND");
  if (user.role === "PATIENT" && String(appointment.patientId) !== String(user.patientId)) throw new ApiError(403, "You do not have access to this appointment.", "FORBIDDEN");
  return appointment;
}

export function getPatientAppointments(patientId) { return findAppointmentsByPatient(patientId); }
