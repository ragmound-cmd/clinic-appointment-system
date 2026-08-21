import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function getSigningSecret() {
  return Buffer.from(env.jwtSecretHex, "hex");
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getSigningSecret(), { expiresIn: env.jwtExpiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSigningSecret());
}

export const authConfig = Object.freeze({ refreshTokensEnabled: false });
