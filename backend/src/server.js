import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureSuperAdmin } from "./services/superAdmin.service.js";
import logger from "./utils/logger.js";

async function start() {
  await connectDB();
  await ensureSuperAdmin();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down.`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force exit if connections do not close in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
  process.exit(1);
});

start().catch((error) => {
  logger.error("Failed to start the server", error);
  process.exit(1);
});
