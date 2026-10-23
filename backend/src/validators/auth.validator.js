import { z } from "zod";
import { emailRule, passwordRule } from "./common.js";

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
