import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  specialty: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true, trim: true },
  bio: { type: String, default: "" },
  education: { type: String, default: "" },
  experienceYears: { type: Number, min: 0, default: 0 },
  consultationFee: { type: Number, min: 0, default: 0 },
  location: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 },
  reviews: { type: [reviewSchema], default: [] },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
}, { timestamps: true });

export const Doctor = mongoose.model("Doctor", doctorSchema);
