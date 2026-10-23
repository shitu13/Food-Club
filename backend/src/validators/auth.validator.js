import { z } from "zod";
import { emailRule, nameRule, passwordRule, phoneRule } from "./common.js";

export const loginSchema = {
  body: z.object({
    email: emailRule,
    password: z.string().min(1, "Password is required.").max(128),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required.").max(128),
    newPassword: passwordRule,
  }),
};

// People can change their own name and phone. Email, role and status can only be changed by the super admin.
export const updateProfileSchema = {
  body: z
    .object({
      name: nameRule.optional(),
      phone: phoneRule.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, "Provide at least one field to update."),
};
