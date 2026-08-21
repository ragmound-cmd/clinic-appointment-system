import { Patient } from "./patient.model.js";

export function createPatient(data) { return Patient.create(data); }
export function findPatientByUserId(userId) { return Patient.findOne({ userId }).lean(); }
