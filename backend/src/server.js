import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env, validateEnvironment } from "./config/env.js";

export async function startServer() {
  validateEnvironment();
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, "0.0.0.0", () => {
    console.info(`CarePulse API listening on port ${env.port}`);
  });
  server.on("error", (error) => {
    console.error("CarePulse server startup error:", error);
  });
  const shutdown = async (signal) => {
    console.info(`${signal} received. Shutting down CarePulse...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  return server;
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  startServer().catch((error) => {
    console.error("CarePulse initialization failed:", error);
    process.exitCode = 1;
  });
}
