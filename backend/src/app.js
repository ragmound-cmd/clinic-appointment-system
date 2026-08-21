import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { doctorRouter } from "./modules/doctors/doctor.routes.js";
import { appointmentRouter } from "./modules/appointments/appointment.routes.js";
import { success } from "./utils/api-response.js";

export function createApp() {
  const app = express();
  const configuredOrigins = env.corsOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);
  const allowedOrigins = [...new Set([
    ...configuredOrigins,
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ])];
  const allowAllDevelopmentOrigins = env.nodeEnv !== "production";

  app.use(helmet());
  app.use(cors({
    origin: (requestOrigin, callback) => {
      if (allowAllDevelopmentOrigins) return callback(null, true);
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return callback(null, true);
      return callback(new Error("CORS origin is not allowed."));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  const health = (_request, response) => success(response, { status: "ok" }, "Healthy");
  app.get("/health", health);
  app.get("/api/v1/health", health);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/doctors", doctorRouter);
  app.use("/api/v1/appointments", appointmentRouter);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
}
