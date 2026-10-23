import { env } from "../config/env.js";
import { ROLES } from "../constants/roles.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

/**
 * Creates the first super admin from SUPERADMIN_* environment variables.
 * Safe to run on every start: an existing account is never changed.
 */
export async function ensureSuperAdmin() {
  const { SUPERADMIN_NAME: name, SUPERADMIN_EMAIL: email, SUPERADMIN_PASSWORD: password } = env;

  if (!email || !password) {
    logger.info("SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set, skipping super admin setup.");
    return { created: false };
  }

  const existing = await User.findOne({ email });
  if (existing) return { created: false, user: existing };

  const user = await User.create({ name, email, password, role: ROLES.SUPER_ADMIN });
  logger.info(`Super admin created: ${user.email}`);
  return { created: true, user };
}
