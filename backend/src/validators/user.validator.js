import { z } from "zod";
import { booleanQuery, emailRule, idParams, paginationQuery, passwordRule } from "./common.js";

const nameRule = z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long.");

const phoneRule = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[\d\s-]{7,20}$/.test(value), "Enter a valid phone number.");

export const listManagersSchema = {
  query: z.object({
    ...paginationQuery,
    search: z.string().trim().max(100).optional(),
    isActive: booleanQuery.optional(),
  }),
};

export const createManagerSchema = {
  body: z.object({
    name: nameRule,
    email: emailRule,
    phone: phoneRule.optional(),
    password: passwordRule,
  }),
};

export const updateManagerSchema = {
  params: idParams,
  body: z
    .object({
      name: nameRule.optional(),
      phone: phoneRule.optional(),
      isActive: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update."),
};

export const resetPasswordSchema = {
  params: idParams,
  body: z.object({ password: passwordRule }),
};

export const managerIdSchema = { params: idParams };
