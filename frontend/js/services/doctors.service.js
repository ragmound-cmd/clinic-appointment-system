import { apiClient } from "../core/api-client.js";

export async function getDoctors() {
  const response = await apiClient.get("/doctors");
  return response?.doctors || [];
}

export async function getDoctor(id) {
  const response = await apiClient.get(`/doctors/${encodeURIComponent(id)}`);
  return response?.doctor || null;
}

export async function getDoctorAvailability(id) {
  const response = await apiClient.get(`/doctors/${encodeURIComponent(id)}/availability`);
  return response?.slots || [];
}

export async function registerDoctor(payload) {
  const response = await apiClient.post("/doctors", payload);
  return response?.doctor || null;
}
