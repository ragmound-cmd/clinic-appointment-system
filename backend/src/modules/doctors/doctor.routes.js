import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import * as controller from "./doctor.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";

export const doctorRouter = Router();
doctorRouter.post("/", authenticate, requireRole("ADMIN"), asyncHandler(controller.registerDoctor));
doctorRouter.get("/", asyncHandler(controller.listDoctors));
doctorRouter.get("/:id/availability", asyncHandler(controller.getAvailability));
doctorRouter.get("/:id", asyncHandler(controller.getDoctor));
