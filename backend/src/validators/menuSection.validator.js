import { z } from "zod";
import { booleanQuery, idParams } from "./common.js";

const menuSectionBody = z.object({
  name: z.object({
    en: z.string().trim().min(2, "English name must be at least 2 characters.").max(60, "Name is too long."),
    bn: z.string().trim().max(60, "Name is too long.").optional(),
  }),
  description: z
    .object({
      en: z.string().trim().max(200, "Description is too long.").optional(),
      bn: z.string().trim().max(200, "Description is too long.").optional(),
    })
    .optional(),
  position: z.number().int("Order must be a whole number.").min(0, "Order cannot be negative.").max(9999, "Order is too large.").optional(),
  isActive: z.boolean().optional(),
});

export const listMenuSectionsSchema = {
  query: z.object({
    search: z.string().trim().max(100).optional(),
    isActive: booleanQuery.optional(),
  }),
};

export const menuSectionIdSchema = { params: idParams };

export const createMenuSectionSchema = { body: menuSectionBody };

export const updateMenuSectionSchema = {
  params: idParams,
  body: menuSectionBody.partial().refine((body) => Object.keys(body).length > 0, "Provide at least one field to update."),
};
