import { z } from "zod";
import { DISH_CATEGORIES, DISH_SORTS } from "../constants/dish.js";
import { booleanQuery, idParams, objectId, paginationQuery } from "./common.js";

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const hasAtMostTwoDecimals = (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

const dishBody = z.object({
  name: z.object({
    en: z.string().trim().min(2, "English name must be at least 2 characters.").max(100, "Name is too long."),
    bn: z.string().trim().max(100, "Name is too long.").optional(),
  }),
  description: z
    .object({
      en: z.string().trim().max(500, "Description is too long.").optional(),
      bn: z.string().trim().max(500, "Description is too long.").optional(),
    })
    .optional(),
  price: z
    .number()
    .min(0, "Price cannot be negative.")
    .max(1_000_000, "Price is too high.")
    .refine(hasAtMostTwoDecimals, "Price can have at most 2 decimal places."),
  category: z.enum(DISH_CATEGORIES),
  sections: z
    .array(objectId)
    .min(1, "Select at least one menu item.")
    .transform((ids) => [...new Set(ids)]),
  image: z
    .string()
    .trim()
    .max(500, "Image link is too long.")
    .refine((value) => value === "" || isHttpUrl(value), "Image must be a valid http(s) link.")
    .optional(),
  isAvailable: z.boolean().optional(),
});

export const listDishesSchema = {
  query: z.object({
    ...paginationQuery,
    search: z.string().trim().max(100).optional(),
    category: z.enum(DISH_CATEGORIES).optional(),
    section: objectId.optional(),
    isAvailable: booleanQuery.optional(),
    sort: z.enum(DISH_SORTS).default("newest"),
  }),
};

export const dishIdSchema = { params: idParams };

export const createDishSchema = { body: dishBody };

export const updateDishSchema = {
  params: idParams,
  body: dishBody.partial().refine((body) => Object.keys(body).length > 0, "Provide at least one field to update."),
};
