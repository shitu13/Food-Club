import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

mongoose.set("strictQuery", true);

export async function connectDB() {
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));
  mongoose.connection.on("error", (error) => logger.error("MongoDB error", error));

  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  logger.info(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
