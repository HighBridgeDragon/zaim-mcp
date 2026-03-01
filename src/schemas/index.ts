import type { z } from "zod";
import { homeAccountResponseSchema } from "./account.js";
import {
  defaultCategoryResponseSchema,
  homeCategoryResponseSchema,
} from "./category.js";
import { currencyResponseSchema } from "./currency.js";
import { homeGenreResponseSchema } from "./genre.js";
import { moneyResponseSchema } from "./money.js";
import { verifyResponseSchema } from "./verify.js";

export const responseSchemas: Record<string, z.ZodType> = {
  "/v2/home/user/verify": verifyResponseSchema,
  "/v2/home/money": moneyResponseSchema,
  "/v2/home/category": homeCategoryResponseSchema,
  "/v2/home/genre": homeGenreResponseSchema,
  "/v2/home/account": homeAccountResponseSchema,
  "/v2/category": defaultCategoryResponseSchema,
  "/v2/currency": currencyResponseSchema,
};

export {
  verifyResponseSchema,
  moneyResponseSchema,
  homeCategoryResponseSchema,
  homeGenreResponseSchema,
  homeAccountResponseSchema,
  defaultCategoryResponseSchema,
  currencyResponseSchema,
};
