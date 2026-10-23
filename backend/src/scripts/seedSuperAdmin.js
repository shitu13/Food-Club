import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { ensureSuperAdmin } from "../services/superAdmin.service.js";

try {
  if (!env.SUPERADMIN_EMAIL) {
    console.error("Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in your .env file first.");
    process.exitCode = 1;
  } else {
    await connectDB();
    const { created, user } = await ensureSuperAdmin();
    console.log(created ? `Super admin created: ${user.email}` : `Super admin already exists: ${env.SUPERADMIN_EMAIL}`);
  }
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}