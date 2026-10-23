import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");

export const idParams = z.object({ id: objectId });

export const emailRule = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email is too long.")
  .email("Enter a valid email address.");

export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/\d/, "Password must contain at least one number.");

export const booleanQuery = z.enum(["true", "false"]).transform((value) => value === "true");

export const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const nameRule = z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long.");

export const phoneRule = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[\d\s-]{7,20}$/.test(value), "Enter a valid phone number.");
