import { getCurrentUser, logout } from "../services/auth.service.js";

function setVisibility(elements, visible) {
  elements.forEach((element) => { element.hidden = !visible; });
}

export async function initAuthUi(root = document) {
  const loginLinks = [...root.querySelectorAll("[data-auth-login]")];
  const registerLinks = [...root.querySelectorAll("[data-auth-register]")];
  const logoutLinks = [...root.querySelectorAll("[data-auth-logout]")];
  if (!loginLinks.length && !registerLinks.length && !logoutLinks.length) return;

  const user = await getCurrentUser();
  setVisibility(loginLinks, !user);
  setVisibility(registerLinks, !user);
  setVisibility(logoutLinks, Boolean(user));

  logoutLinks.forEach((link) => link.addEventListener("click", async (event) => {
    event.preventDefault();
    link.setAttribute("aria-busy", "true");
    link.textContent = "Signing out...";
    try {
      await logout();
      window.location.href = "./index.html";
    } finally {
      link.removeAttribute("aria-busy");
    }
  }, { once: true }));
}
