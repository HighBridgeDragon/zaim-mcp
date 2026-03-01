import crypto from "node:crypto";

import OAuth from "oauth-1.0a";

import { responseSchemas } from "./schemas/index.js";

const BASE_URL = "https://api.zaim.net";
const ALLOWED_HOST = new URL(BASE_URL).host;

export function buildURL(path: string): URL {
  const url = new URL(path, BASE_URL);
  if (url.host !== ALLOWED_HOST) {
    throw new Error("Invalid API path: unauthorized host");
  }
  return url;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export class ZaimClient {
  private oauth: OAuth;
  private token: OAuth.Token;

  constructor() {
    this.oauth = new OAuth({
      consumer: {
        key: requireEnv("ZAIM_CONSUMER_KEY"),
        secret: requireEnv("ZAIM_CONSUMER_SECRET"),
      },
      signature_method: "HMAC-SHA1",
      hash_function(baseString, key) {
        return crypto
          .createHmac("sha1", key)
          .update(baseString)
          .digest("base64");
      },
    });

    this.token = {
      key: requireEnv("ZAIM_ACCESS_TOKEN"),
      secret: requireEnv("ZAIM_ACCESS_TOKEN_SECRET"),
    };
  }

  private validateResponse(path: string, data: unknown): void {
    const schema = responseSchemas[path];
    if (!schema) return;
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error(
        `[zaim-mcp] Schema validation warning for ${path}:`,
        JSON.stringify(result.error.issues, null, 2),
      );
    }
  }

  async get(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<unknown> {
    const url = buildURL(path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const urlString = url.toString();
    const headers = this.oauth.toHeader(
      this.oauth.authorize({ url: urlString, method: "GET" }, this.token),
    );

    const response = await fetch(urlString, {
      method: "GET",
      headers: { ...headers, Accept: "application/json" },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const truncated = body.length > 200 ? `${body.slice(0, 200)}...` : body;
      throw new Error(
        `Zaim API error: ${response.status} ${response.statusText} - ${truncated}`,
      );
    }

    const data = await response.json();
    this.validateResponse(path, data);
    return data;
  }
}
