import OAuth from "oauth-1.0a";
import crypto from "crypto";

const BASE_URL = "https://api.zaim.net";
const ALLOWED_HOST = new URL(BASE_URL).host;

export class ZaimClient {
  private oauth: OAuth;
  private token: OAuth.Token;

  constructor() {
    const consumerKey = process.env.ZAIM_CONSUMER_KEY;
    const consumerSecret = process.env.ZAIM_CONSUMER_SECRET;
    const accessToken = process.env.ZAIM_ACCESS_TOKEN;
    const accessTokenSecret = process.env.ZAIM_ACCESS_TOKEN_SECRET;

    if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
      throw new Error(
        "Missing Zaim API credentials. Set ZAIM_CONSUMER_KEY, ZAIM_CONSUMER_SECRET, ZAIM_ACCESS_TOKEN, ZAIM_ACCESS_TOKEN_SECRET environment variables."
      );
    }

    this.oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: "HMAC-SHA1",
      hash_function(baseString, key) {
        return crypto.createHmac("sha1", key).update(baseString).digest("base64");
      },
    });

    this.token = { key: accessToken, secret: accessTokenSecret };
  }

  private buildURL(path: string): URL {
    const url = new URL(path, BASE_URL);
    if (url.host !== ALLOWED_HOST) {
      throw new Error("Invalid API path: unauthorized host");
    }
    return url;
  }

  async get<T = unknown>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = this.buildURL(path);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const requestData: OAuth.RequestOptions = {
      url: url.toString(),
      method: "GET",
    };

    const headers = this.oauth.toHeader(this.oauth.authorize(requestData, this.token));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...headers,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body;
      throw new Error(`Zaim API error: ${response.status} ${response.statusText} - ${truncatedBody}`);
    }

    return response.json() as Promise<T>;
  }
}
