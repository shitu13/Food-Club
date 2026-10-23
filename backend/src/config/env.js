import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),

    MONGODB_URI: z
      .string()
      .refine(
        (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
        "MONGODB_URI must start with mongodb:// or mongodb+srv://"
      ),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_EXPIRES_IN: z.string().default("12h"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

    CLIENT_URL: z.string().default("http://localhost:5173"),

    SUPERADMIN_NAME: z.string().trim().min(2).default("Super Admin"),
    SUPERADMIN_EMAIL: z.string().trim().toLowerCase().email().optional(),
    SUPERADMIN_PASSWORD: z.string().min(8, "SUPERADMIN_PASSWORD must be at least 8 characters").optional(),
  })
  .refine(
    (value) => Boolean(value.SUPERADMIN_EMAIL) === Boolean(value.SUPERADMIN_PASSWORD),
    "Set both SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD, or neither"
  );

// An empty value in .env (for example "SUPERADMIN_EMAIL=") counts as "not set".
const source = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));
const result = schema.safeParse(source);

if (!result.success) {
  const lines = result.error.issues.map((issue) => ` - ${issue.path.join(".") || "env"}: ${issue.message}`);
  console.error(`Invalid environment configuration:\n${lines.join("\n")}\nCopy .env.example to .env and fill in the values.`);
  process.exit(1);
}

const config = result.data;

export const env = Object.freeze({
  ...config,
  isProduction: config.NODE_ENV === "production",
  isDevelopment: config.NODE_ENV === "development",
  clientOrigins: config.CLIENT_URL.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
});
