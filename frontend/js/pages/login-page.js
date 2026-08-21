import { login } from "../services/auth.service.js";
import { AUTH_RULES } from "../core/config.js";

function setError(input, target, message) {
  target.textContent = message;
  target.hidden = !message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function safeReturnTo(value) {
  if (!value) return "./index.html";
  try {
    const url = new URL(value, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith(window.location.pathname.replace("login.html", ""))) {
      return "./index.html";
    }
    return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
  } catch {
    return "./index.html";
  }
}

export function initLoginPage(root = document) {
  const form = root.querySelector("#login-form");
  if (!form) return;
  const email = root.querySelector("#login-email");
  const password = root.querySelector("#login-password");
  const submit = root.querySelector("#login-submit");
  const status = root.querySelector("#login-status");
  const emailError = root.querySelector("#login-email-error");
  const passwordError = root.querySelector("#login-password-error");
  const returnTo = safeReturnTo(new URL(window.location.href).searchParams.get("returnTo"));
  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError(email, emailError, "");
    setError(password, passwordError, "");
    status.textContent = "";

    const emailValue = email.value.trim();
    let valid = true;
    if (!emailValue) { setError(email, emailError, "Enter your email address."); valid = false; }
    else if (!email.validity.valid) { setError(email, emailError, "Enter a valid email address."); valid = false; }
    if (!password.value) { setError(password, passwordError, "Enter your password."); valid = false; }
    else if (password.value.length < AUTH_RULES.passwordMinimumLength) { setError(password, passwordError, `Password must be at least ${AUTH_RULES.passwordMinimumLength} characters.`); valid = false; }
    if (!valid) { status.textContent = "Please correct the highlighted fields."; return; }

    submitting = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Signing in...";
    try {
      await login({ email: emailValue, password: password.value });
      status.textContent = "Signed in successfully. Redirecting...";
      window.location.href = returnTo;
    } catch {
      status.textContent = "We could not sign you in. Please check your details and try again.";
      submitting = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

initLoginPage();
