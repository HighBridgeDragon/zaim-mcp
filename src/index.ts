import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { dateSchema, errorResult, successResult } from "./helpers.js";
import { ZaimClient } from "./zaim-client.js";

function registerSimpleGetTool(
  server: McpServer,
  client: ZaimClient,
  name: string,
  title: string,
  description: string,
  path: string,
  params?: Record<string, string | number>,
): void {
  server.registerTool(
    name,
    { title, description, inputSchema: z.object({}) },
    async () => {
      try {
        return successResult(await client.get(path, params));
      } catch (e) {
        return errorResult(e);
      }
    },
  );
}

const server = new McpServer({
  name: "zaim-mcp",
  version: "1.0.0",
});

const client = new ZaimClient();

registerSimpleGetTool(
  server,
  client,
  "zaim_verify",
  "Zaim認証確認",
  "Zaim APIの認証状態を確認し、ユーザー情報を返します",
  "/v2/home/user/verify",
);

server.registerTool(
  "zaim_get_money",
  {
    title: "Zaim収支取得",
    description:
      "Zaimの収支記録を取得します（手動入力データのみ。銀行・カード連携データは対象外）。日付範囲・カテゴリ・種別でフィルタ可能です",
    inputSchema: z.object({
      mode: z
        .enum(["payment", "income", "transfer"])
        .optional()
        .describe("種別フィルタ: payment=支出, income=収入, transfer=振替"),
      start_date: dateSchema.optional().describe("開始日 (YYYY-MM-DD)"),
      end_date: dateSchema.optional().describe("終了日 (YYYY-MM-DD)"),
      category_id: z.number().optional().describe("カテゴリID"),
      genre_id: z.number().optional().describe("ジャンルID"),
      order: z
        .enum(["id", "date"])
        .optional()
        .describe("ソート基準 (デフォルト: date)"),
      group_by: z
        .literal("receipt_id")
        .optional()
        .describe("receipt_idでグルーピング"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("取得件数 (1-100, デフォルト20)"),
      page: z.number().min(1).optional().describe("ページ番号 (デフォルト1)"),
    }),
  },
  async (params) => {
    try {
      return successResult(
        await client.get("/v2/home/money", { mapping: 1, ...params }),
      );
    } catch (e) {
      return errorResult(e);
    }
  },
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_categories",
  "Zaimカテゴリ取得",
  "ユーザーのカテゴリ一覧を取得します",
  "/v2/home/category",
  { mapping: 1 },
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_genres",
  "Zaimジャンル取得",
  "ユーザーのジャンル一覧を取得します",
  "/v2/home/genre",
  { mapping: 1 },
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_accounts",
  "Zaim口座取得",
  "ユーザーの口座一覧を取得します",
  "/v2/home/account",
  { mapping: 1 },
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_default_categories",
  "Zaimデフォルトカテゴリ取得",
  "Zaimのデフォルトカテゴリ一覧を取得します",
  "/v2/category",
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_currencies",
  "Zaim通貨取得",
  "利用可能な通貨一覧を取得します",
  "/v2/currency",
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zaim MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
