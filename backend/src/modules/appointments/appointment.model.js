import mongoose from "mongoose";
import { APPOINTMENT_STATUSES, TIMEZONE, VISIT_TYPES } from "../../config/constants.js";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  availabilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true },
  appointmentDate: { type: String, required: true },
  startTime: { type: String, required: true },
  visitType: { type: String, enum: Object.values(VISIT_TYPES), required: true },
  status: { type: String, enum: Object.values(APPOINTMENT_STATUSES), default: APPOINTMENT_STATUSES.CONFIRMED, required: true },
  timezone: { type: String, default: TIMEZONE, immutable: true },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, startTime: 1, status: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1, startTime: 1, status: 1 });
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "CONFIRMED" } },
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
