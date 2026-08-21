export function success(response, data = {}, message = "Success", statusCode = 200) {
  return response.status(statusCode).json({ success: true, message, ...data });
}

export function created(response, data = {}, message = "Created") {
  return success(response, data, message, 201);
}
