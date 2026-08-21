import { createDoctorCard } from "../components/doctor-card.js";
import { getDoctors } from "../services/doctors.service.js";

const state = { search: "", specialty: "", availability: "" };
let doctors = [];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function filteredDoctors() {
  const query = normalize(state.search);
  return doctors.filter((doctor) => {
    const matchesSearch = !query || [doctor.name, doctor.specialty, doctor.availabilityLabel]
      .some((field) => normalize(field).includes(query));
    const matchesSpecialty = !state.specialty || doctor.specialtyKey === state.specialty;
    const matchesAvailability = !state.availability || doctor.availabilityKey === state.availability;
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });
}

function render(elements) {
  const matches = filteredDoctors();
  elements.results.replaceChildren();
  matches.forEach((doctor) => elements.results.append(createDoctorCard(doctor)));
  elements.emptyState.classList.toggle("hidden", matches.length > 0);
  elements.status.textContent = `${matches.length} doctor${matches.length === 1 ? "" : "s"} found`;
}

export async function initDoctorsPage(documentRoot) {
  const searchInputs = [...documentRoot.querySelectorAll('input[name="search"]')];
  const specialty = documentRoot.querySelector("#specialty-filter");
  const availability = documentRoot.querySelector("#availability-filter");
  const elements = {
    results: documentRoot.querySelector("#doctor-results"),
    emptyState: documentRoot.querySelector("#doctor-empty-state"),
    status: documentRoot.querySelector("#doctor-results-status"),
  };

  if (!specialty || !availability || Object.values(elements).some((element) => !element)) return;

  elements.status.textContent = "Loading doctors...";
  try {
    doctors = await getDoctors();
  } catch {
    elements.results.replaceChildren();
    elements.emptyState.classList.add("hidden");
    elements.status.textContent = "Unable to load doctors. Please try again later.";
    return;
  }

  searchInputs.forEach((input) => input.addEventListener("input", () => {
    state.search = input.value;
    searchInputs.forEach((other) => {
      if (other !== input) other.value = input.value;
    });
    render(elements);
  }));

  specialty.addEventListener("change", () => {
    state.specialty = specialty.value;
    render(elements);
  });

  availability.addEventListener("change", () => {
    state.availability = availability.value;
    render(elements);
  });

  render(elements);
}
