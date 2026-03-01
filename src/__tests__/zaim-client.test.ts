import { describe, expect, it } from "bun:test";

import { buildURL } from "../zaim-client.js";

describe("buildURL", () => {
  it("正常なAPIパスからURLを構築する", () => {
    const url = buildURL("/v2/home/money");
    expect(url.toString()).toBe("https://api.zaim.net/v2/home/money");
  });

  it("ホストがapi.zaim.netになる", () => {
    const url = buildURL("/v2/category");
    expect(url.host).toBe("api.zaim.net");
  });

  it("SSRF: //evil.com を拒否する", () => {
    expect(() => buildURL("//evil.com/path")).toThrow(
      "Invalid API path: unauthorized host",
    );
  });

  it("SSRF: https://evil.com を拒否する", () => {
    expect(() => buildURL("https://evil.com/steal")).toThrow(
      "Invalid API path: unauthorized host",
    );
  });

  it("SSRF: @evil.com を拒否する", () => {
    expect(() => buildURL("http://user@evil.com")).toThrow(
      "Invalid API path: unauthorized host",
    );
  });
});
