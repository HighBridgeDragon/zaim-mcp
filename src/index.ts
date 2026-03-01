import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { ZaimClient } from "./zaim-client.js";

function isValidDate(d: string): boolean {
  const [year, month, day] = d.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isValidDate, { message: "Invalid date" });

type TextContent = { type: "text"; text: string };
type ToolResult = { content: TextContent[]; isError?: boolean };

function successResult(data: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(e: unknown): ToolResult {
  return {
    content: [{ type: "text", text: `Error: ${(e as Error).message}` }],
    isError: true,
  };
}

function registerSimpleGetTool(
  server: McpServer,
  client: ZaimClient,
  name: string,
  title: string,
  description: string,
  path: string,
): void {
  server.registerTool(
    name,
    { title, description, inputSchema: z.object({}) },
    async () => {
      try {
        return successResult(await client.get(path));
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
      "Zaimの収支記録を取得します。日付範囲・カテゴリ・種別でフィルタ可能です",
    inputSchema: z.object({
      mode: z
        .enum(["payment", "income", "transfer"])
        .optional()
        .describe("種別フィルタ: payment=支出, income=収入, transfer=振替"),
      start_date: dateSchema.optional().describe("開始日 (YYYY-MM-DD)"),
      end_date: dateSchema.optional().describe("終了日 (YYYY-MM-DD)"),
      category_id: z.number().optional().describe("カテゴリID"),
      genre_id: z.number().optional().describe("ジャンルID"),
      account_id: z.number().optional().describe("口座ID"),
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
      const apiParams: Record<string, string | number> = { mapping: 1 };
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          apiParams[key] = value;
        }
      }
      const data = await client.get("/v2/home/money", apiParams);
      return successResult(data);
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
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_genres",
  "Zaimジャンル取得",
  "ユーザーのジャンル一覧を取得します",
  "/v2/home/genre",
);

registerSimpleGetTool(
  server,
  client,
  "zaim_get_accounts",
  "Zaim口座取得",
  "ユーザーの口座一覧を取得します",
  "/v2/home/account",
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
