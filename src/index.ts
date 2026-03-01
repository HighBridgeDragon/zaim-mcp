import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ZaimClient } from "./zaim-client.js";

function isValidDate(d: string): boolean {
  const [year, month, day] = d.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidDate, { message: "Invalid date" });

const server = new McpServer({
  name: "zaim-mcp",
  version: "1.0.0",
});

const client = new ZaimClient();

// 認証確認 & ユーザー情報取得
server.registerTool(
  "zaim_verify",
  {
    title: "Zaim認証確認",
    description: "Zaim APIの認証状態を確認し、ユーザー情報を返します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/home/user/verify");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// 収支記録の取得
server.registerTool(
  "zaim_get_money",
  {
    title: "Zaim収支取得",
    description: "Zaimの収支記録を取得します。日付範囲・カテゴリ・種別でフィルタ可能です",
    inputSchema: z.object({
      mode: z.enum(["payment", "income", "transfer"]).optional().describe("種別フィルタ: payment=支出, income=収入, transfer=振替"),
      start_date: dateSchema.optional().describe("開始日 (YYYY-MM-DD)"),
      end_date: dateSchema.optional().describe("終了日 (YYYY-MM-DD)"),
      category_id: z.number().optional().describe("カテゴリID"),
      genre_id: z.number().optional().describe("ジャンルID"),
      account_id: z.number().optional().describe("口座ID"),
      limit: z.number().min(1).max(100).optional().describe("取得件数 (1-100, デフォルト20)"),
      page: z.number().min(1).optional().describe("ページ番号 (デフォルト1)"),
    }),
  },
  async (params) => {
    try {
      const apiParams: Record<string, string | number> = { mapping: 1 };
      if (params.mode) apiParams.mode = params.mode;
      if (params.start_date) apiParams.start_date = params.start_date;
      if (params.end_date) apiParams.end_date = params.end_date;
      if (params.category_id) apiParams.category_id = params.category_id;
      if (params.genre_id) apiParams.genre_id = params.genre_id;
      if (params.account_id) apiParams.account_id = params.account_id;
      if (params.limit) apiParams.limit = params.limit;
      if (params.page) apiParams.page = params.page;

      const data = await client.get("/v2/home/money", apiParams);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// カテゴリ一覧（ユーザー）
server.registerTool(
  "zaim_get_categories",
  {
    title: "Zaimカテゴリ取得",
    description: "ユーザーのカテゴリ一覧を取得します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/home/category");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// ジャンル一覧（ユーザー）
server.registerTool(
  "zaim_get_genres",
  {
    title: "Zaimジャンル取得",
    description: "ユーザーのジャンル一覧を取得します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/home/genre");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// 口座一覧
server.registerTool(
  "zaim_get_accounts",
  {
    title: "Zaim口座取得",
    description: "ユーザーの口座一覧を取得します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/home/account");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// デフォルトカテゴリ一覧
server.registerTool(
  "zaim_get_default_categories",
  {
    title: "Zaimデフォルトカテゴリ取得",
    description: "Zaimのデフォルトカテゴリ一覧を取得します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/category");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// 通貨一覧
server.registerTool(
  "zaim_get_currencies",
  {
    title: "Zaim通貨取得",
    description: "利用可能な通貨一覧を取得します",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.get("/v2/currency");
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text" as const, text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// サーバー起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zaim MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
