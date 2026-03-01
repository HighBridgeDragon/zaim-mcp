import { execFile } from "node:child_process";

import {
  CLIENT_OPTIONS,
  type ClientId,
  writeConfig,
  type ZaimEnv,
} from "./clients.js";
import { getAccessToken, getRequestToken } from "./oauth.js";
import { askInput, askMultiChoice } from "./prompt.js";

function openBrowser(url: string): void {
  switch (process.platform) {
    case "win32":
      execFile("cmd", ["/c", "start", "", url]);
      break;
    case "darwin":
      execFile("open", [url]);
      break;
    default:
      execFile("xdg-open", [url]);
  }
}

interface ParsedArgs {
  consumerKey?: string;
  consumerSecret?: string;
  clients?: ClientId[];
}

function parseArgs(argv: string[]): ParsedArgs {
  let consumerKey: string | undefined;
  let consumerSecret: string | undefined;
  let clients: ClientId[] | undefined;

  for (const arg of argv) {
    if (arg.startsWith("--consumer-key=")) {
      consumerKey = arg.slice("--consumer-key=".length);
    } else if (arg.startsWith("--consumer-secret=")) {
      consumerSecret = arg.slice("--consumer-secret=".length);
    } else if (arg.startsWith("--client=")) {
      clients = arg.slice("--client=".length).split(",") as ClientId[];
    }
  }

  return { consumerKey, consumerSecret, clients };
}

export async function runInit(argv: string[]): Promise<void> {
  console.error("=== Zaim MCP セットアップ ===\n");

  const args = parseArgs(argv);

  const consumerKey =
    args.consumerKey ??
    (await askInput("Zaim Consumer Key (https://dev.zaim.net/ で取得): "));
  const consumerSecret =
    args.consumerSecret ?? (await askInput("Zaim Consumer Secret: "));

  if (!consumerKey || !consumerSecret) {
    console.error("Error: Consumer Key と Consumer Secret は必須です。");
    process.exit(1);
  }

  console.error("\nRequest Token を取得中...");
  const { token, tokenSecret, authorizeUrl } = await getRequestToken(
    consumerKey,
    consumerSecret,
  );

  console.error(`\nブラウザで認可ページを開きます...\n  ${authorizeUrl}\n`);
  openBrowser(authorizeUrl);

  const verifier = await askInput(
    "認可後に表示される verifier コードを貼り付けてください: ",
  );
  if (!verifier) {
    console.error("Error: verifier コードが入力されていません。");
    process.exit(1);
  }

  console.error("\nAccess Token を取得中...");
  const { accessToken, accessTokenSecret } = await getAccessToken(
    consumerKey,
    consumerSecret,
    token,
    tokenSecret,
    verifier,
  );

  console.error("Access Token の取得に成功しました。\n");

  const env: ZaimEnv = {
    ZAIM_CONSUMER_KEY: consumerKey,
    ZAIM_CONSUMER_SECRET: consumerSecret,
    ZAIM_ACCESS_TOKEN: accessToken,
    ZAIM_ACCESS_TOKEN_SECRET: accessTokenSecret,
  };

  const selectedClients =
    args.clients ??
    (await askMultiChoice(
      "設定先の MCP クライアントを選択してください",
      CLIENT_OPTIONS,
    ));

  for (const client of selectedClients) {
    try {
      const result = writeConfig(client, env);
      console.error(`  [OK] ${result}`);
    } catch (e) {
      console.error(`  [NG] ${client}: ${(e as Error).message}`);
    }
  }

  console.error("\nセットアップ完了！クライアントを再起動してください。");
}
