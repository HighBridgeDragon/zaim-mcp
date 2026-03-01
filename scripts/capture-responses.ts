import { mkdirSync, writeFileSync } from "node:fs";
import { ZaimClient } from "../src/zaim-client.js";

const ENDPOINTS = [
  { path: "/v2/home/user/verify", file: "verify.json" },
  {
    path: "/v2/home/money",
    file: "money.json",
    params: { limit: 5, mapping: 1 },
  },
  { path: "/v2/home/category", file: "home-category.json" },
  { path: "/v2/home/genre", file: "home-genre.json" },
  { path: "/v2/home/account", file: "home-account.json" },
  { path: "/v2/category", file: "default-category.json" },
  { path: "/v2/currency", file: "currency.json" },
] as const;

const FIXTURE_DIR = "src/__tests__/fixtures";

async function main(): Promise<void> {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const client = new ZaimClient();

  for (const ep of ENDPOINTS) {
    console.error(`Fetching ${ep.path}...`);
    const data = await client.get(
      ep.path,
      "params" in ep ? ep.params : undefined,
    );
    const filePath = `${FIXTURE_DIR}/${ep.file}`;
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.error(`  -> ${filePath}`);
  }

  console.error("\nDone. Review and sanitize personal data before committing.");
}

main();
