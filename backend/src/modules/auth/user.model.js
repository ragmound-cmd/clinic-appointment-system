import mongoose from "mongoose";
import { ROLES } from "../../config/constants.js";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.PATIENT, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
