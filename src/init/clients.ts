import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type ClientId =
  | "claude-desktop"
  | "claude-code"
  | "cursor"
  | "windsurf"
  | "vscode";

export interface ClientOption {
  label: string;
  value: ClientId;
}

export const CLIENT_OPTIONS: ClientOption[] = [
  { label: "Claude Desktop", value: "claude-desktop" },
  { label: "Claude Code", value: "claude-code" },
  { label: "Cursor", value: "cursor" },
  { label: "Windsurf", value: "windsurf" },
  { label: "VS Code", value: "vscode" },
];

export interface ZaimEnv {
  ZAIM_CONSUMER_KEY: string;
  ZAIM_CONSUMER_SECRET: string;
  ZAIM_ACCESS_TOKEN: string;
  ZAIM_ACCESS_TOKEN_SECRET: string;
}

const PACKAGE_NAME = "@highbridgedragon/zaim-mcp";
const SERVER_NAME = "zaim";

function getCommand(): { command: string; args: string[] } {
  if (process.platform === "win32") {
    return { command: "cmd", args: ["/c", "npx", "-y", PACKAGE_NAME] };
  }
  return { command: "npx", args: ["-y", PACKAGE_NAME] };
}

function getAppDataDir(): string {
  const home = os.homedir();
  return process.env.APPDATA ?? path.join(home, "AppData", "Roaming");
}

function getConfigPath(client: Exclude<ClientId, "claude-code">): string {
  const home = os.homedir();
  const platform = process.platform;

  switch (client) {
    case "claude-desktop": {
      if (platform === "win32")
        return path.join(
          getAppDataDir(),
          "Claude",
          "claude_desktop_config.json",
        );
      if (platform === "darwin")
        return path.join(
          home,
          "Library",
          "Application Support",
          "Claude",
          "claude_desktop_config.json",
        );
      return path.join(home, ".config", "Claude", "claude_desktop_config.json");
    }
    case "cursor":
      return path.join(home, ".cursor", "mcp.json");
    case "windsurf":
      return path.join(home, ".codeium", "windsurf", "mcp_config.json");
    case "vscode": {
      if (platform === "win32")
        return path.join(getAppDataDir(), "Code", "User", "mcp.json");
      if (platform === "darwin")
        return path.join(
          home,
          "Library",
          "Application Support",
          "Code",
          "User",
          "mcp.json",
        );
      return path.join(home, ".config", "Code", "User", "mcp.json");
    }
  }
}

function writeJsonConfig(
  client: Exclude<ClientId, "claude-code">,
  env: ZaimEnv,
): string {
  const configPath = getConfigPath(client);
  const dir = path.dirname(configPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let config: Record<string, unknown> = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  const { command, args } = getCommand();
  const isVscode = client === "vscode";
  const rootKey = isVscode ? "servers" : "mcpServers";

  const serverEntry: Record<string, unknown> = {
    command,
    args,
    env,
    ...(isVscode && { type: "stdio" }),
  };

  const servers = (config[rootKey] as Record<string, unknown>) ?? {};
  servers[SERVER_NAME] = serverEntry;
  config[rootKey] = servers;

  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return configPath;
}

function writeClaudeCodeConfig(env: ZaimEnv): void {
  const envArgs: string[] = [];
  for (const [key, value] of Object.entries(env)) {
    envArgs.push("--env", `${key}=${value}`);
  }

  const { command, args } = getCommand();
  execFileSync(
    "claude",
    [
      "mcp",
      "add",
      "--transport",
      "stdio",
      ...envArgs,
      SERVER_NAME,
      "--",
      command,
      ...args,
    ],
    { stdio: "inherit" },
  );
}

export function writeConfig(client: ClientId, env: ZaimEnv): string {
  if (client === "claude-code") {
    writeClaudeCodeConfig(env);
    return "Claude Code (claude mcp add)";
  }
  return writeJsonConfig(client, env);
}
