import { z } from "zod";

const userSchema = z
  .object({
    id: z.number(),
    login: z.string(),
    name: z.string(),
    input_count: z.number(),
    day_count: z.number(),
    repeat_count: z.number(),
    day: z.number(),
    week: z.number(),
    month: z.number(),
    active: z.number(),
    currency_code: z.string(),
    profile_image_url: z.string(),
    cover_image_url: z.string(),
    profile_modified: z.string(),
    created: z.string(),
  })
  .passthrough();

export const verifyResponseSchema = z
  .object({
    me: userSchema,
    requested: z.number(),
  })
  .passthrough();
