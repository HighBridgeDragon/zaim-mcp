import { z } from "zod";

const accountItemSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    modified: z.string(),
    sort: z.number(),
    active: z.number(),
    local_id: z.number(),
    website_id: z.number(),
    parent_account_id: z.number(),
  })
  .passthrough();

export const homeAccountResponseSchema = z
  .object({
    accounts: z.array(accountItemSchema),
    requested: z.number(),
  })
  .passthrough();
