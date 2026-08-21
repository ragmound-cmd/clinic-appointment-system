import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/api-error.js";
import { signAccessToken } from "../../config/auth.js";
import { ROLES } from "../../config/constants.js";
import { createUser, findUserByEmail, findUserById } from "./auth.repository.js";
import { createPatient, findPatientByUserId } from "./patient.repository.js";

function publicUser(user) {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
}

export async function register({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError(409, "An account with this email already exists.", "EMAIL_ALREADY_REGISTERED");
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const user = await createUser({ email, passwordHash: await bcrypt.hash(password, 12), firstName, lastName: rest.join(" "), role: ROLES.PATIENT });
  const patient = await createPatient({ userId: user.id });
  return { user: publicUser(user), token: signAccessToken({ sub: user.id, patientId: patient.id, role: user.role }) };
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email, true);
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, "Invalid email or password.", "AUTHENTICATION_FAILED");
  const patient = user.role === ROLES.PATIENT ? await findPatientByUserId(user.id) : null;
  return { user: publicUser(user), token: signAccessToken({ sub: user.id, patientId: patient?.id, role: user.role }) };
}

export async function getCurrentUser(id) {
  const user = await findUserById(id);
  if (!user || !user.isActive) throw new ApiError(401, "Authentication is required.", "UNAUTHENTICATED");
  return publicUser(user);
}
