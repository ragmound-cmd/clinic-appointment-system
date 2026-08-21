import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  dateOfBirth: { type: Date },
}, { timestamps: true });

export const Patient = mongoose.model("Patient", patientSchema);
