import * as doctorService from "./doctor.service.js";
import { z } from "zod";
import { ApiError } from "../../utils/api-error.js";
import { success } from "../../utils/api-response.js";

const registrationSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.email(), password: z.string().min(8), phone: z.string().trim().min(1).max(40), specialty: z.string().trim().min(1).max(120), licenseNumber: z.string().trim().min(1).max(80), experienceYears: z.coerce.number().min(0), education: z.string().trim().min(1).max(240), bio: z.string().trim().max(2000).optional().default(""), consultationFee: z.coerce.number().min(0) });

export async function listDoctors(_request, response) { return success(response, { doctors: await doctorService.listDoctors() }, "Doctors retrieved"); }
export async function getDoctor(request, response) { return success(response, { doctor: await doctorService.getDoctor(request.params.id) }, "Doctor retrieved"); }
export async function getAvailability(request, response) { return success(response, { slots: await doctorService.getAvailability(request.params.id) }, "Availability retrieved"); }
export async function registerDoctor(request, response) {
  const parsed = registrationSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(422, "Invalid doctor details.", "VALIDATION_ERROR", parsed.error.flatten());
  return success(response, { doctor: await doctorService.registerDoctor(parsed.data) }, "Doctor registered", 201);
}
