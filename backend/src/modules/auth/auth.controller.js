import { z } from "zod";
import * as authService from "./auth.service.js";
import { ApiError } from "../../utils/api-error.js";
import { created, success } from "../../utils/api-response.js";

const credentials = z.object({ email: z.email(), password: z.string().min(8) });
const registration = credentials.extend({ name: z.string().trim().min(1).max(120) });

export async function register(request, response) {
  const parsed = registration.safeParse(request.body);
  if (!parsed.success) throw new ApiError(422, "Invalid registration details.", "VALIDATION_ERROR", parsed.error.flatten());
  return created(response, await authService.register(parsed.data), "Account created");
}

export async function login(request, response) {
  const parsed = credentials.safeParse(request.body);
  if (!parsed.success) throw new ApiError(422, "Invalid login details.", "VALIDATION_ERROR", parsed.error.flatten());
  return success(response, await authService.login(parsed.data), "Login successful");
}

export async function me(request, response) { return success(response, { user: await authService.getCurrentUser(request.user.sub) }, "Current user retrieved"); }
export async function logout(_request, response) { return response.status(204).send(); }
