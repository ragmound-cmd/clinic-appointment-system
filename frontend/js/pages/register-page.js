import { register } from "../services/auth.service.js";
import { AUTH_RULES } from "../core/config.js";

function setError(input, target, message) {
  target.textContent = message;
  target.hidden = !message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

export function initRegisterPage(root = document) {
  const form = root.querySelector("#register-form");
  if (!form) return;
  const name = root.querySelector("#register-name");
  const email = root.querySelector("#register-email");
  const password = root.querySelector("#register-password");
  const confirmation = root.querySelector("#register-password-confirmation");
  const submit = root.querySelector("#register-submit");
  const status = root.querySelector("#register-status");
  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    const fields = [
      [name, root.querySelector("#register-name-error"), !name.value.trim() ? "Enter your name." : ""],
      [email, root.querySelector("#register-email-error"), !email.value.trim() ? "Enter your email address." : (!email.validity.valid ? "Enter a valid email address." : "")],
      [password, root.querySelector("#register-password-error"), !password.value ? "Create a password." : (password.value.length < AUTH_RULES.passwordMinimumLength ? `Password must be at least ${AUTH_RULES.passwordMinimumLength} characters.` : "")],
      [confirmation, root.querySelector("#register-password-confirmation-error"), !confirmation.value ? "Confirm your password." : (confirmation.value !== password.value ? "Passwords do not match." : "")],
    ];
    let valid = true;
    fields.forEach(([input, target, message]) => { setError(input, target, message); if (message) valid = false; });
    status.textContent = valid ? "" : "Please correct the highlighted fields.";
    if (!valid) return;

    submitting = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Creating account...";
    try {
      await register({ name: name.value.trim(), email: email.value.trim(), password: password.value });
      status.textContent = "Development account created. Redirecting...";
      window.location.href = "./index.html";
    } catch (error) {
      status.textContent = error.code === "EMAIL_ALREADY_REGISTERED" ? "An account with this email already exists." : "We could not create your account. Please try again.";
      submitting = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

initRegisterPage();
