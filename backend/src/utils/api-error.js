export class ApiError extends Error {
  constructor(statusCode, message, code = "INTERNAL_ERROR", details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}
