import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ApiError } from "../../utils/api-error.js";
import { ROLES } from "../../config/constants.js";
import { User } from "../auth/user.model.js";
import { createDoctor, findActiveDoctors, findAvailabilityByDoctor, findDoctorById, findDoctorByLicense } from "./doctor.repository.js";

const TIMEZONE = "Africa/Lagos";

function key(value) { const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "_"); return normalized === "general_practice" ? "general" : normalized; }
function weekdayInLagos(offset = 0) {
  const date = new Date(Date.now() + offset * 86400000);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, weekday: "short" }).format(date);
  return { Sun: 7, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday];
}

function normalizeDoctor(doctor, availability = []) {
  const name = [doctor.userId?.firstName, doctor.userId?.lastName].filter(Boolean).join(" ") || "Doctor";
  const avatarSeed = encodeURIComponent(name);
  const image = doctor.imageUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${avatarSeed}`;
  const hasToday = availability.some((slot) => slot.dayOfWeek === weekdayInLagos());
  const hasTomorrow = availability.some((slot) => slot.dayOfWeek === weekdayInLagos(1));
  return { id: String(doctor._id), name, specialty: doctor.specialty, specialtyKey: key(doctor.specialty), image, imageAlt: name, rating: doctor.rating || null, reviewCount: doctor.reviewCount || doctor.reviews?.length || 0, reviews: doctor.reviews || [], experience: `${doctor.experienceYears} Years`, education: doctor.education, bio: doctor.bio, location: doctor.location, consultationFee: doctor.consultationFee, availabilityKey: hasToday ? "today" : hasTomorrow ? "tomorrow" : "", availabilityLabel: hasToday ? "Available today" : hasTomorrow ? "Available tomorrow" : "Weekday availability", profileUrl: "./doctor-profile.html" };
}

export async function listDoctors() {
  const doctors = await findActiveDoctors();
  return Promise.all(doctors.map(async (doctor) => normalizeDoctor(doctor, await findAvailabilityByDoctor(doctor._id))));
}

export async function getDoctor(id) {
  const doctor = await findDoctorById(id);
  if (!doctor || doctor.status !== "ACTIVE") throw new ApiError(404, "Doctor not found.", "DOCTOR_NOT_FOUND");
  return normalizeDoctor(doctor, await findAvailabilityByDoctor(doctor._id));
}

export async function getAvailability(id) {
  await getDoctor(id);
  return findAvailabilityByDoctor(id);
}

export async function registerDoctor({ name, email, password, phone, specialty, licenseNumber, experienceYears, education, bio, consultationFee }) {
  if (await User.findOne({ email: email.toLowerCase() })) throw new ApiError(409, "An account with this email already exists.", "EMAIL_ALREADY_REGISTERED");
  if (await findDoctorByLicense(licenseNumber)) throw new ApiError(409, "This medical license is already registered.", "LICENSE_ALREADY_REGISTERED");
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const session = await mongoose.startSession();
  try {
    let doctor;
    await session.withTransaction(async () => {
      const [user] = await User.create([{ email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), firstName, lastName: rest.join(" "), phone, role: ROLES.DOCTOR }], { session });
      doctor = await createDoctor({ userId: user._id, specialty, licenseNumber, experienceYears, education, bio, consultationFee }, { session });
    });
    return normalizeDoctor(await findDoctorById(doctor._id));
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, "The doctor email or license is already registered.", "DOCTOR_ALREADY_REGISTERED");
    throw error;
  } finally { await session.endSession(); }
}
