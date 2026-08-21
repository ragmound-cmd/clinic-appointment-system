import "dotenv/config";

const required = ["JWT_SECRET_HEX"];

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || process.env.DBSTRING || "",
  jwtSecretHex: process.env.JWT_SECRET_HEX || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5500,http://127.0.0.1:5500",
});

export function validateEnvironment({ requireDatabase = true } = {}) {
  const missing = required.filter((key) => !process.env[key]);
  if (requireDatabase && !env.mongoUri) missing.push("MONGODB_URI or DBSTRING");
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  if (!/^[0-9a-f]+$/i.test(env.jwtSecretHex) || env.jwtSecretHex.length % 2 !== 0) {
    throw new Error("JWT_SECRET_HEX must be a non-empty hexadecimal string with an even length.");
  }
}
