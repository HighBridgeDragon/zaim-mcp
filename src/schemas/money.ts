import { z } from "zod";

const moneyItemSchema = z
  .object({
    id: z.number(),
    user_id: z.number(),
    date: z.string(),
    mode: z.enum(["payment", "income", "transfer"]),
    category_id: z.number(),
    genre_id: z.number(),
    from_account_id: z.number(),
    to_account_id: z.number(),
    amount: z.number(),
    comment: z.string(),
    active: z.number(),
    created: z.string(),
    currency_code: z.string(),
    name: z.string(),
    receipt_id: z.number(),
    place_uid: z.string(),
    place: z.string(),
    original_money_ids: z.array(z.number()).optional(),
  })
  .passthrough();

export const moneyResponseSchema = z
  .object({
    money: z.array(moneyItemSchema),
    requested: z.number(),
  })
  .passthrough();
