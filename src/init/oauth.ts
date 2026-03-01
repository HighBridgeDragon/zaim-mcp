import crypto from "node:crypto";
import OAuth from "oauth-1.0a";

const AUTHORIZE_URL = "https://auth.zaim.net/users/auth";
const REQUEST_TOKEN_URL = "https://api.zaim.net/v2/auth/request";
const ACCESS_TOKEN_URL = "https://api.zaim.net/v2/auth/access";

function createOAuth(consumerKey: string, consumerSecret: string): OAuth {
  return new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });
}

function parseOAuthResponse(
  params: URLSearchParams,
  label: string,
): { token: string; tokenSecret: string } {
  const token = params.get("oauth_token");
  const tokenSecret = params.get("oauth_token_secret");

  if (!token || !tokenSecret) {
    throw new Error(`${label} のパースに失敗しました`);
  }

  return { token, tokenSecret };
}

export interface RequestTokenResult {
  token: string;
  tokenSecret: string;
  authorizeUrl: string;
}

export async function getRequestToken(
  consumerKey: string,
  consumerSecret: string,
): Promise<RequestTokenResult> {
  const oauth = createOAuth(consumerKey, consumerSecret);
  const requestData = {
    url: REQUEST_TOKEN_URL,
    method: "POST" as const,
    data: { oauth_callback: "oob" },
  };
  const headers = oauth.toHeader(oauth.authorize(requestData));

  // Spread converts OAuth.Header to a plain Record<string, string> for fetch
  const res = await fetch(REQUEST_TOKEN_URL, {
    method: "POST",
    headers: { ...headers },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request Token 取得失敗: ${res.status} - ${body}`);
  }

  const params = new URLSearchParams(await res.text());
  const { token, tokenSecret } = parseOAuthResponse(params, "Request Token");

  return {
    token,
    tokenSecret,
    authorizeUrl: `${AUTHORIZE_URL}?oauth_token=${token}`,
  };
}

export interface AccessTokenResult {
  accessToken: string;
  accessTokenSecret: string;
}

export async function getAccessToken(
  consumerKey: string,
  consumerSecret: string,
  requestToken: string,
  requestTokenSecret: string,
  verifier: string,
): Promise<AccessTokenResult> {
  const oauth = createOAuth(consumerKey, consumerSecret);
  const requestData = {
    url: ACCESS_TOKEN_URL,
    method: "POST" as const,
    data: { oauth_verifier: verifier },
  };
  const token = { key: requestToken, secret: requestTokenSecret };
  const headers = oauth.toHeader(oauth.authorize(requestData, token));

  const res = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: { ...headers },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Access Token 取得失敗: ${res.status} - ${body}`);
  }

  const params = new URLSearchParams(await res.text());
  const result = parseOAuthResponse(params, "Access Token");

  return {
    accessToken: result.token,
    accessTokenSecret: result.tokenSecret,
  };
}
