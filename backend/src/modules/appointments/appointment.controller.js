import { z } from "zod";
import { ApiError } from "../../utils/api-error.js";
import * as appointmentService from "./appointment.service.js";
import { created, success } from "../../utils/api-response.js";

const createSchema = z.object({ doctorId: z.string().min(1), availabilityId: z.string().min(1), appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: z.string().regex(/^\d{2}:\d{2}$/), visitType: z.string().min(1) });

export async function createAppointment(request, response) {
  const parsed = createSchema.safeParse(request.body);
  if (!parsed.success) throw new ApiError(422, "Invalid appointment details.", "VALIDATION_ERROR", parsed.error.flatten());
  const appointment = await appointmentService.createAppointment({ patientId: request.user.patientId, ...parsed.data });
  return created(response, { appointment }, "Appointment created");
}

export async function getAppointment(request, response) { return success(response, { appointment: await appointmentService.getAppointment(request.params.id, request.user) }, "Appointment retrieved"); }
export async function listAppointments(request, response) {
  if (request.user.role !== "PATIENT") throw new ApiError(403, "Only patients can access this appointment list.", "FORBIDDEN");
  return success(response, { appointments: await appointmentService.getPatientAppointments(request.user.patientId) }, "Appointments retrieved");
}
