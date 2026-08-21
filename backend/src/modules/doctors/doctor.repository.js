import { Doctor } from "./doctor.model.js";
import { Availability } from "./availability.model.js";

export function findActiveDoctors() { return Doctor.find({ status: "ACTIVE" }).populate("userId", "firstName lastName email").lean(); }
export function findDoctorById(id) { return Doctor.findById(id).populate("userId", "firstName lastName email").lean(); }
export function findDoctorByLicense(licenseNumber) { return Doctor.findOne({ licenseNumber }).lean(); }
export function findAvailabilityByDoctor(doctorId) { return Availability.find({ doctorId, isActive: true }).lean(); }
export function findAvailabilityById(id) { return Availability.findById(id).lean(); }
export function createDoctor(data, options = {}) { return Doctor.create([data], options).then(([doctor]) => doctor); }
