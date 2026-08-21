import { createAppointment, hasAppointmentForDoctor } from "../services/appointments.service.js";
import { getDoctor, getDoctorAvailability } from "../services/doctors.service.js";
import { APPOINTMENT_RULES } from "../core/config.js";
import { TIMEZONE } from "../core/constants.js";
import { validateAppointment, validateDoctorId } from "../core/appointment-validation.js";

const unavailable = "Not available in the current prototype data.";
const prototypeTimes = APPOINTMENT_RULES.timeSlots;

function avatarFor(doctor) {
  return doctor.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctor.name || doctor.id)}`;
}

function setText(root, selector, value) { root.querySelector(selector)?.replaceChildren(root.ownerDocument.createTextNode(value)); }
function showNotFound(root) { root.querySelectorAll("[data-profile-content]").forEach((e) => e.classList.add("hidden")); root.querySelector("#doctor-profile-status")?.classList.remove("hidden"); }
function setPressed(buttons, selected) { buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === selected))); }
function renderReviews(root, reviews) {
  const container = root.querySelector("#profile-doctor-review-list");
  if (!container) return;
  container.replaceChildren();
  if (!reviews?.length) { setText(root, "#profile-doctor-review-list", unavailable); return; }
  reviews.forEach((review) => {
    const item = root.createElement("div"); item.className = "border-b border-surface-container-high pb-md last:border-0 last:pb-0";
    const heading = root.createElement("p"); heading.className = "font-label-md text-label-md text-primary"; heading.textContent = `${review.reviewerName} · ${review.rating}/5`;
    const text = root.createElement("p"); text.className = "font-body-sm text-body-sm text-on-surface-variant mt-sm"; text.textContent = review.text;
    item.append(heading, text); container.append(item);
  });
}
function formatTime(time) { const [hour, minute] = time.split(":").map(Number); return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`; }
function currentLagosDate() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: TIMEZONE, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return new Date(year, month - 1, day);
}

function renderCalendar(root, monthDate) {
  const calendar = root.querySelector("#booking-calendar");
  const label = root.querySelector("#booking-month");
  if (!calendar || !label) return [];
  const year = monthDate.getFullYear(); const month = monthDate.getMonth();
  label.textContent = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(monthDate);
  calendar.replaceChildren();
  for (let i = 0; i < new Date(year, month, 1).getDay(); i += 1) calendar.append(root.createElement("div"));
  const buttons = []; const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day += 1) {
    const button = root.createElement("button"); const date = new Date(year, month, day);
    button.type = "button"; button.className = "p-1 w-full rounded-full hover:bg-surface-container-highest transition-colors";
    button.dataset.date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; button.dataset.value = button.dataset.date; button.setAttribute("aria-pressed", "false"); button.textContent = day;
    if (date.getDay() === 0 || date.getDay() === 6) { button.disabled = true; button.className = "p-1 w-full rounded-full text-outline-variant opacity-50 cursor-not-allowed"; }
    calendar.append(button); buttons.push(button);
  }
  return buttons;
}

function renderTimes(root) {
  const container = root.querySelector("#booking-time-slots"); if (!container) return [];
  container.replaceChildren();
  return prototypeTimes.map((time) => { const button = root.createElement("button"); button.type = "button"; button.className = "py-2 px-1 text-center rounded border border-surface-container-high font-body-sm text-body-sm text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"; button.dataset.time = time; button.dataset.value = time; button.setAttribute("aria-pressed", "false"); button.textContent = formatTime(time); container.append(button); return button; });
}

export async function initDoctorProfilePage(root) {
  const id = new URL(window.location.href).searchParams.get("id");
  let doctor;
  try { doctor = await getDoctor(id); } catch {
    root.querySelectorAll("[data-profile-content]").forEach((element) => element.classList.add("hidden"));
    const status = root.querySelector("#doctor-profile-status");
    status?.classList.remove("hidden");
    root.querySelector("#doctor-profile-status-message")?.replaceChildren(root.ownerDocument.createTextNode("Unable to load this doctor profile. Please try again later."));
    return;
  }
  if (!validateDoctorId(id) || !doctor) { showNotFound(root); return; }
  root.querySelector("#doctor-profile-status")?.classList.add("hidden"); root.querySelectorAll("[data-profile-content]").forEach((e) => e.classList.remove("hidden"));
  const image = root.querySelector("#profile-doctor-image"); if (image) { image.src = avatarFor(doctor); image.alt = doctor.imageAlt; image.addEventListener("error", () => { image.src = avatarFor({ ...doctor, image: "" }); }, { once: true }); }
  setText(root, "#profile-doctor-name", doctor.name); setText(root, "#profile-doctor-specialty", doctor.specialty); setText(root, "#profile-doctor-rating", doctor.rating ?? unavailable); setText(root, "#profile-doctor-review-count", doctor.reviewCount ? `(${doctor.reviewCount})` : ""); setText(root, "#profile-doctor-education", doctor.education || unavailable); setText(root, "#profile-doctor-experience", doctor.experience || unavailable); setText(root, "#profile-doctor-location", doctor.location || unavailable); setText(root, "#profile-doctor-biography", doctor.bio || unavailable); setText(root, "#profile-doctor-highlights", unavailable); setText(root, "#profile-doctor-fee", doctor.consultationFee ? `₦${Number(doctor.consultationFee).toLocaleString()}` : unavailable); renderReviews(root, doctor.reviews);
  let availability = [];
  try { availability = await getDoctorAvailability(doctor.id); } catch { availability = []; }
  const state = { doctorId: doctor.id, availabilityId: "", visitType: root.querySelector('input[name="visitType"]:checked')?.value || "", date: "", time: "" }; const dates = renderCalendar(root, currentLagosDate()); const times = renderTimes(root); const status = root.querySelector("#booking-status");
  const confirmButton = root.querySelector("#confirm-booking");
  try {
    if (confirmButton && await hasAppointmentForDoctor(doctor.id)) {
      confirmButton.disabled = true;
      confirmButton.setAttribute("aria-disabled", "true");
      confirmButton.textContent = "Appointment already selected";
      if (status) status.textContent = "You already have an appointment with this doctor.";
    }
  } catch (error) {
    if (error?.status !== 401 && error?.status !== 403 && status) status.textContent = "Unable to check existing appointments. You can still try booking.";
  }
  dates.forEach((button) => button.addEventListener("click", () => { if (!button.disabled) { state.date = button.dataset.date; setPressed(dates, state.date); if (status) status.textContent = ""; } }));
  times.forEach((button) => button.addEventListener("click", () => { state.time = button.dataset.time; setPressed(times, state.time); if (status) status.textContent = ""; }));
  root.querySelectorAll('input[name="visitType"]').forEach((input) => input.addEventListener("change", () => { state.visitType = input.value; if (status) status.textContent = ""; }));
  confirmButton?.addEventListener("click", async () => {
    const validation = validateAppointment({ doctor, ...state });
    if (!validation.valid) { if (status) status.textContent = validation.message; return; }
    const button = root.querySelector("#confirm-booking");
    if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
    if (status) status.textContent = "Creating appointment...";
    try {
      const matchingAvailability = availability.find((slot) => String(slot.dayOfWeek) === String(((new Date(`${state.date}T00:00:00`).getDay() + 6) % 7) + 1) && slot.visitType === state.visitType && state.time >= slot.startTime && state.time < slot.endTime);
      if (!matchingAvailability) throw new Error("The selected slot is not available.");
      state.availabilityId = matchingAvailability._id || matchingAvailability.id;
      const appointment = await createAppointment(state);
      if (!appointment?.id && !appointment?._id) throw new Error("Appointment identity was not returned.");
      const destination = new URL("./my-appointments.html", window.location.href);
      destination.searchParams.set("appointmentId", appointment.id || appointment._id);
      window.location.href = `${destination.pathname}${destination.search}`;
    } catch (error) {
      if (error?.status === 401) {
        const returnTarget = new URL(window.location.href);
        returnTarget.hash = "booking-section";
        const loginUrl = new URL("./login.html", window.location.href);
        loginUrl.searchParams.set("returnTo", `${returnTarget.pathname}${returnTarget.search}${returnTarget.hash}`);
        window.location.href = `${loginUrl.pathname}${loginUrl.search}`;
        return;
      }
      if (status) status.textContent = error?.status === 409 ? "This appointment slot is no longer available. Please choose another time." : "Unable to create appointment. Please try again.";
      if (button) { button.disabled = false; button.removeAttribute("aria-busy"); }
    }
  });
}
