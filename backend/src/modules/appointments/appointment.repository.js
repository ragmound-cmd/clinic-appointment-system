import { Appointment } from "./appointment.model.js";

export function findAppointmentById(id) { return Appointment.findById(id).lean(); }
export function findAppointmentsByPatient(patientId) { return Appointment.find({ patientId }).sort({ appointmentDate: 1, startTime: 1 }).lean(); }
export function findDoctorConflict({ doctorId, appointmentDate, startTime }) { return Appointment.findOne({ doctorId, appointmentDate, startTime, status: "CONFIRMED" }).lean(); }
export function createAppointment(data) { return Appointment.create(data); }
