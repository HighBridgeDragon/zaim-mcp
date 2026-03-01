import { z } from "zod";

const currencyItemSchema = z
  .object({
    currency_code: z.string(),
    unit: z.string(),
    point: z.number(),
    name: z.string(),
  })
  .passthrough();

export const currencyResponseSchema = z
  .object({
    currencies: z.array(currencyItemSchema),
    requested: z.number(),
  })
  .passthrough();
