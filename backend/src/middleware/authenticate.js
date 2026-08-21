import { verifyAccessToken } from "../config/auth.js";
import { ApiError } from "../utils/api-error.js";

export function authenticate(request, _response, next) {
  const header = request.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, "Authentication is required.", "UNAUTHENTICATED"));
  try {
    request.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new ApiError(401, "Authentication is required.", "UNAUTHENTICATED"));
  }
}
