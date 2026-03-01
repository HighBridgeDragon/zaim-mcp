import { beforeAll, describe, expect, it } from "bun:test";

import {
  currencyResponseSchema,
  defaultCategoryResponseSchema,
  homeAccountResponseSchema,
  homeCategoryResponseSchema,
  homeGenreResponseSchema,
  moneyResponseSchema,
  verifyResponseSchema,
} from "../schemas/index.js";
import { ZaimClient } from "../zaim-client.js";

describe("Zaim APIレスポンススキーマ検証", () => {
  let client: ZaimClient;

  beforeAll(() => {
    client = new ZaimClient();
  });

  it("GET /v2/home/user/verify", async () => {
    const data = await client.get("/v2/home/user/verify");
    const result = verifyResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/home/money", async () => {
    const data = await client.get("/v2/home/money", { limit: 1, mapping: 1 });
    const result = moneyResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/home/category", async () => {
    const data = await client.get("/v2/home/category");
    const result = homeCategoryResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/home/genre", async () => {
    const data = await client.get("/v2/home/genre");
    const result = homeGenreResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/home/account", async () => {
    const data = await client.get("/v2/home/account");
    const result = homeAccountResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/category", async () => {
    const data = await client.get("/v2/category");
    const result = defaultCategoryResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it("GET /v2/currency", async () => {
    const data = await client.get("/v2/currency");
    const result = currencyResponseSchema.safeParse(data);
    if (!result.success) {
      console.error("Validation issues:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });
});
