import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { writeConfig, type ZaimEnv } from "../../init/clients.js";

const TEST_ENV: ZaimEnv = {
  ZAIM_CONSUMER_KEY: "test_ck",
  ZAIM_CONSUMER_SECRET: "test_cs",
  ZAIM_ACCESS_TOKEN: "test_at",
  ZAIM_ACCESS_TOKEN_SECRET: "test_ats",
};

describe("writeConfig", () => {
  let tmpDir: string;
  let origPlatform: string;
  let origAppdata: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zaim-mcp-test-"));
    origPlatform = process.platform;
    origAppdata = process.env.APPDATA;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    Object.defineProperty(process, "platform", { value: origPlatform });
    process.env.APPDATA = origAppdata;
  });

  it("Claude Desktop (Windows): mcpServers に zaim を追加する", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const claudeDir = path.join(tmpDir, "Claude");
    process.env.APPDATA = tmpDir;

    const result = writeConfig("claude-desktop", TEST_ENV);
    expect(result).toContain("claude_desktop_config.json");

    const config = JSON.parse(
      fs.readFileSync(
        path.join(claudeDir, "claude_desktop_config.json"),
        "utf-8",
      ),
    );
    expect(config.mcpServers.zaim).toBeDefined();
    expect(config.mcpServers.zaim.command).toBe("cmd");
    expect(config.mcpServers.zaim.args[0]).toBe("/c");
    expect(config.mcpServers.zaim.env.ZAIM_CONSUMER_KEY).toBe("test_ck");
  });

  it("VS Code: servers キーと type: stdio を使用する", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    process.env.APPDATA = tmpDir;

    writeConfig("vscode", TEST_ENV);

    const config = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "Code", "User", "mcp.json"), "utf-8"),
    );
    expect(config.servers).toBeDefined();
    expect(config.servers.zaim.type).toBe("stdio");
    expect(config.mcpServers).toBeUndefined();
  });

  it("既存設定を上書きせずマージする", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const claudeDir = path.join(tmpDir, "Claude");
    fs.mkdirSync(claudeDir, { recursive: true });
    process.env.APPDATA = tmpDir;

    const existing = {
      mcpServers: { other: { command: "test", args: [] } },
      someOtherKey: true,
    };
    fs.writeFileSync(
      path.join(claudeDir, "claude_desktop_config.json"),
      JSON.stringify(existing),
    );

    writeConfig("claude-desktop", TEST_ENV);

    const config = JSON.parse(
      fs.readFileSync(
        path.join(claudeDir, "claude_desktop_config.json"),
        "utf-8",
      ),
    );
    expect(config.mcpServers.other.command).toBe("test");
    expect(config.mcpServers.zaim).toBeDefined();
    expect(config.someOtherKey).toBe(true);
  });
});
