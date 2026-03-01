import { beforeAll, describe, expect, it } from "bun:test";

import { responseSchemas } from "../schemas/index.js";
import { ZaimClient } from "../zaim-client.js";

const endpoints: {
  path: string;
  params?: Record<string, string | number>;
}[] = [
  { path: "/v2/home/user/verify" },
  { path: "/v2/home/money", params: { limit: 1, mapping: 1 } },
  { path: "/v2/home/category", params: { mapping: 1 } },
  { path: "/v2/home/genre", params: { mapping: 1 } },
  { path: "/v2/home/account", params: { mapping: 1 } },
];

const TEST_TIMEOUT = 15_000;

describe("Zaim APIレスポンススキーマ検証", () => {
  let client: ZaimClient;

  beforeAll(() => {
    client = new ZaimClient();
  });

  for (const { path, params } of endpoints) {
    it(
      `GET ${path}`,
      async () => {
        const data = await client.get(path, params);
        const schema = responseSchemas[path];
        const result = schema.safeParse(data);
        if (!result.success) {
          console.error("Validation issues:", result.error.issues);
        }
        expect(result.success).toBe(true);
      },
      TEST_TIMEOUT,
    );
  }
});
