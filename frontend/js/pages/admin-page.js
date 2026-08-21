import { registerDoctor } from "../services/doctors.service.js";

export function initAdminPage(documentRoot) {
  const form = documentRoot.querySelector("#doctor-registration-form");
  if (!form) return;
  const status = documentRoot.querySelector("#doctor-registration-status");
  const submit = form.querySelector('button[type="submit"]');
  let submitting = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = { name: values.doctorName, email: values.email, password: values.password, phone: values.phone, licenseNumber: values.licenseNumber, experienceYears: Number(values.yearsExperience), education: values.education, specialty: values.specialty, bio: values.bio || "", consultationFee: Number(values.consultationFee) };
    submitting = true;
    submit.disabled = true;
    if (status) status.textContent = "Registering doctor...";
    try {
      await registerDoctor(payload);
      form.reset();
      if (status) status.textContent = "Doctor registered successfully.";
    } catch (error) {
      if (status) status.textContent = error.code === "FORBIDDEN" ? "Only an admin can register doctors." : "Unable to register doctor. Please review the details and try again.";
    } finally { submitting = false; submit.disabled = false; }
  });
}
