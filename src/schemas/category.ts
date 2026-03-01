import { z } from "zod";

const homeCategoryItemSchema = z
  .object({
    id: z.number(),
    mode: z.enum(["payment", "income"]),
    name: z.string(),
    sort: z.number(),
    active: z.number(),
    modified: z.string(),
    parent_category_id: z.number(),
    local_id: z.number(),
  })
  .passthrough();

export const homeCategoryResponseSchema = z
  .object({
    categories: z.array(homeCategoryItemSchema),
    requested: z.number(),
  })
  .passthrough();

const defaultCategoryItemSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    mode: z.enum(["payment", "income"]),
  })
  .passthrough();

export const defaultCategoryResponseSchema = z
  .object({
    categories: z.array(defaultCategoryItemSchema),
    requested: z.number(),
  })
  .passthrough();
