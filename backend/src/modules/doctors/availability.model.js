import mongoose from "mongoose";
import { VISIT_TYPES, TIMEZONE } from "../../config/constants.js";

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  dayOfWeek: { type: Number, min: 1, max: 5, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  visitType: { type: String, enum: Object.values(VISIT_TYPES), required: true },
  timezone: { type: String, default: TIMEZONE, immutable: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Availability = mongoose.model("Availability", availabilitySchema);
