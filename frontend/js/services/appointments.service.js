import { apiClient } from "../core/api-client.js";

function normalizeAppointment(appointment) {
  if (!appointment) return null;
  return {
    ...appointment,
    id: appointment.id || appointment._id,
    date: appointment.date || appointment.appointmentDate,
    time: appointment.time || appointment.startTime,
  };
}

export async function createAppointment(payload) {
  const response = await apiClient.post("/appointments", {
    doctorId: payload.doctorId,
    availabilityId: payload.availabilityId,
    appointmentDate: payload.date,
    startTime: payload.time,
    visitType: payload.visitType,
  });
  return normalizeAppointment(response?.appointment);
}

export async function getAppointment(id) {
  const response = await apiClient.get(`/appointments/${encodeURIComponent(id)}`);
  return normalizeAppointment(response?.appointment);
}

export async function getAppointments() {
  const response = await apiClient.get("/appointments");
  return (response?.appointments || []).map(normalizeAppointment);
}

export async function hasAppointmentForDoctor(doctorId) {
  const appointments = await getAppointments();
  return appointments.some((appointment) => String(appointment.doctorId) === String(doctorId));
}
