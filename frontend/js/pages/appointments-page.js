import { getAppointment } from "../services/appointments.service.js";
import { getDoctor } from "../services/doctors.service.js";
import { renderAppointmentSummary } from "../components/appointment-summary.js";
import { validateAppointmentId, validateAppointment } from "../core/appointment-validation.js";

function showEmptyState(documentRoot, message = "No appointment was selected.") {
  documentRoot.querySelector("#appointment-summary")?.classList.add("hidden");
  documentRoot.querySelector("#appointment-empty-state")?.classList.remove("hidden");
  documentRoot.querySelector("#appointment-status-message").textContent = message;
}

export function initAppointmentsPage(documentRoot) {
  const appointmentId = new URL(window.location.href).searchParams.get("appointmentId");
  const status = documentRoot.querySelector("#appointment-status-message");
  if (!validateAppointmentId(appointmentId)) { showEmptyState(documentRoot); return; }
  if (status) status.textContent = "Loading appointment...";
  getAppointment(appointmentId).then(async (appointment) => {
    const doctor = await getDoctor(appointment?.doctorId);
    if (!appointment || !validateAppointment({ doctor, ...appointment }).valid) { showEmptyState(documentRoot); return; }
    documentRoot.querySelector("#appointment-empty-state")?.classList.add("hidden");
    documentRoot.querySelector("#appointment-summary")?.classList.remove("hidden");
    if (status) status.textContent = "Appointment loaded successfully.";
    renderAppointmentSummary(documentRoot, { ...appointment, doctorName: doctor.name, specialty: doctor.specialty, doctorImage: doctor.image });
  }).catch(() => {
    if (status) status.textContent = "Unable to load this appointment.";
    showEmptyState(documentRoot, "Unable to load this appointment. Please return to the doctor directory and try again.");
  });
}
