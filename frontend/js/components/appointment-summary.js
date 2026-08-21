import { APPOINTMENT_STATUSES, VISIT_TYPES } from "../core/constants.js";

function setText(root, selector, value) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

export function renderAppointmentSummary(root, appointment) {
  setText(root, "#appointment-prototype-status", appointment.status === APPOINTMENT_STATUSES.CONFIRMED ? "Confirmed" : appointment.status);
  setText(root, "#appointment-doctor", `${appointment.doctorName} - ${appointment.specialty}`);
  setText(root, "#appointment-date", appointment.date);
  setText(root, "#appointment-time", appointment.time);
  setText(root, "#appointment-visit-type", appointment.visitType === VISIT_TYPES.PHYSICAL_CONSULTATION ? "Physical consultation" : "Online consultation");
  const image = root.querySelector("#appointment-doctor-image");
  if (image && appointment.doctorImage) { image.src = appointment.doctorImage; image.alt = appointment.doctorName; }
}
