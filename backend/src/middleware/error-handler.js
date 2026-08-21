import { isApiError } from "../utils/api-error.js";
import { ApiError } from "../utils/api-error.js";

export function notFoundHandler(request, _response, next) {
  next(new ApiError(404, "Route not found.", "ROUTE_NOT_FOUND"));
}

export function globalErrorHandler(error, _request, response, _next) {
  const apiError = isApiError(error) ? error : null;
  const statusCode = apiError?.statusCode || 500;
  const payload = { error: { code: apiError?.code || "INTERNAL_ERROR", message: apiError?.message || "An unexpected error occurred." } };
  if (apiError?.details !== undefined) payload.error.details = apiError.details;
  if (statusCode >= 500) console.error(error);
  return response.status(statusCode).json(payload);
}
