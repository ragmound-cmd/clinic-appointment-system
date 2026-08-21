import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../modules/auth/user.model.js";
import { Doctor } from "../modules/doctors/doctor.model.js";
import { Availability } from "../modules/doctors/availability.model.js";
import { ROLES, VISIT_TYPES } from "../config/constants.js";

const demoPassword = process.env.DEMO_DOCTOR_PASSWORD;
if (!demoPassword || demoPassword.length < 8) throw new Error("DEMO_DOCTOR_PASSWORD must be provided and contain at least 8 characters.");

const specialties = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics", "General Practice"];
const firstNames = ["Amina", "Chinedu", "Fatima", "Ibrahim", "Ngozi", "Tunde", "Ada", "Yusuf", "Zainab", "Emeka"];
const lastNames = ["Okafor", "Bello", "Adeyemi", "Eze", "Abubakar", "Nwosu", "Balogun", "Musa", "Ojo", "Ibrahim"];
const locations = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Benin City"];
const startTimes = ["09:00", "11:00", "13:00", "15:00", "17:00"];
const reviewTexts = ["Clear explanation and a very professional consultation.", "The appointment was helpful and the doctor listened carefully.", "Friendly, punctual, and easy to communicate with."];

await mongoose.connect(env.mongoUri);
const passwordHash = await bcrypt.hash(demoPassword, 12);
let created = 0;
for (let index = 1; index <= 20; index += 1) {
  const firstName = firstNames[(index - 1) % firstNames.length];
  const lastName = lastNames[(index - 1) % lastNames.length];
  const email = `demo.doctor.${index}@carepulse.test`;
  const licenseNumber = `DEMO-MED-${String(index).padStart(4, "0")}`;
  const reviews = reviewTexts.map((text, reviewIndex) => ({ reviewerName: ["Michael R.", "Aisha K.", "Daniel O."][reviewIndex], rating: 4 + (reviewIndex === 1 ? 0 : 1), text: `${text} (demo review)`, date: new Date(Date.now() - (reviewIndex + 1) * 86400000) }));
  let doctor = await Doctor.findOne({ licenseNumber });
  if (!doctor) {
    const existingUser = await User.findOne({ email });
    const user = existingUser || await User.create({ email, passwordHash, firstName, lastName, phone: `+234800000${String(index).padStart(4, "0")}`, role: ROLES.DOCTOR });
    doctor = await Doctor.create({ userId: user._id, specialty: specialties[(index - 1) % specialties.length], licenseNumber, education: "CarePulse Demo Medical College", experienceYears: index % 15, bio: "Development demonstration doctor profile.", consultationFee: 10000 + index * 500, location: locations[(index - 1) % locations.length], imageUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`, reviews, rating: 4.7, reviewCount: reviews.length });
    created += 1;
  }
  await Doctor.updateOne({ _id: doctor._id }, { $set: { reviews, rating: 4.7, reviewCount: reviews.length, location: doctor.location || locations[(index - 1) % locations.length] } });
  const availability = [];
  for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
    for (const visitType of Object.values(VISIT_TYPES)) {
      for (const startTime of startTimes) {
        const endHour = Number(startTime.slice(0, 2)) + 2;
        availability.push({ doctorId: doctor._id, dayOfWeek, startTime, endTime: `${String(endHour).padStart(2, "0")}:00`, visitType, timezone: "Africa/Lagos", isActive: true });
      }
    }
  }
  await Availability.bulkWrite(availability.map((slot) => ({ updateOne: { filter: { doctorId: slot.doctorId, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, visitType: slot.visitType }, update: { $setOnInsert: slot }, upsert: true } })));
}
console.info(`Seeded ${created} demo doctors.`);
await mongoose.disconnect();
