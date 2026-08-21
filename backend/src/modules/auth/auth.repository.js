import { User } from "./user.model.js";

export function findUserByEmail(email, includePassword = false) { return User.findOne({ email: email.toLowerCase() }).select(includePassword ? "+passwordHash" : ""); }
export function findUserById(id) { return User.findById(id); }
export function createUser(data) { return User.create(data); }
