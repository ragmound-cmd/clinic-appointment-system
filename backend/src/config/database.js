import mongoose from "mongoose";
import { env } from "./env.js";

let listenersAttached = false;

function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. The driver will manage reconnection attempts.");
  });
  mongoose.connection.on("reconnected", () => {
    console.info("MongoDB reconnected.");
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
}

export async function connectDatabase() {
  if (!env.mongoUri) throw new Error("MongoDB connection string is not configured.");
  attachConnectionListeners();
  console.info("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri);
  console.info("MongoDB connection established.");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
