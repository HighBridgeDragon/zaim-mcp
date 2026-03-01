import { describe, expect, it } from "bun:test";

import {
  homeAccountResponseSchema,
  homeCategoryResponseSchema,
  homeGenreResponseSchema,
  moneyResponseSchema,
  verifyResponseSchema,
} from "../schemas/index.js";

import homeAccountFixture from "./fixtures/home-account.json";
import homeCategoryFixture from "./fixtures/home-category.json";
import homeGenreFixture from "./fixtures/home-genre.json";
import moneyFixture from "./fixtures/money.json";
import verifyFixture from "./fixtures/verify.json";

const schemas = [
  {
    name: "verifyResponseSchema",
    schema: verifyResponseSchema,
    fixture: verifyFixture,
    requiredKey: "me",
  },
  {
    name: "moneyResponseSchema",
    schema: moneyResponseSchema,
    fixture: moneyFixture,
    requiredKey: "money",
  },
  {
    name: "homeCategoryResponseSchema",
    schema: homeCategoryResponseSchema,
    fixture: homeCategoryFixture,
    requiredKey: "categories",
  },
  {
    name: "homeGenreResponseSchema",
    schema: homeGenreResponseSchema,
    fixture: homeGenreFixture,
    requiredKey: "genres",
  },
  {
    name: "homeAccountResponseSchema",
    schema: homeAccountResponseSchema,
    fixture: homeAccountFixture,
    requiredKey: "accounts",
  },
] as const;

for (const { name, schema, fixture, requiredKey } of schemas) {
  describe(name, () => {
    it("フィクスチャデータを受け入れる", () => {
      const result = schema.safeParse(fixture);
      expect(result.success).toBe(true);
    });

    it("必須キーが欠落したデータを拒否する", () => {
      const { [requiredKey]: _, ...rest } = fixture as Record<string, unknown>;
      const result = schema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("未知のフィールドを許容する (passthrough)", () => {
      const result = schema.safeParse({
        ...fixture,
        unknown_field: "test",
      });
      expect(result.success).toBe(true);
    });
  });
}
