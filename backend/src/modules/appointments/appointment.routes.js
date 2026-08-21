import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";
import * as controller from "./appointment.controller.js";

export const appointmentRouter = Router();
appointmentRouter.use(authenticate, requireRole("PATIENT"));
appointmentRouter.post("/", asyncHandler(controller.createAppointment));
appointmentRouter.get("/", asyncHandler(controller.listAppointments));
appointmentRouter.get("/:id", asyncHandler(controller.getAppointment));
