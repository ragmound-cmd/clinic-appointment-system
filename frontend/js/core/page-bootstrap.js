import { initDoctorsPage } from "../pages/doctors-page.js";
import { initDoctorProfilePage } from "../pages/doctor-profile-page.js";
import { initAppointmentsPage } from "../pages/appointments-page.js";
import { initAdminPage } from "../pages/admin-page.js";
import { initAuthUi } from "./auth-ui.js";

const pageControllers = {
  doctors: initDoctorsPage,
  "doctor-profile": initDoctorProfilePage,
  appointments: initAppointmentsPage,
  admin: initAdminPage,
};

export function bootstrapPage(documentRoot = document.documentElement) {
  const pageName = documentRoot.dataset.page;
  const controller = pageControllers[pageName];

  if (typeof controller === "function") {
    Promise.resolve(controller(documentRoot)).catch(() => {
      const status = documentRoot.querySelector('[role="status"][aria-live]');
      if (status) status.textContent = "Unable to initialize this page.";
    });
  }
  Promise.resolve(initAuthUi(documentRoot)).catch(() => {});
}
