import http from "node:http";
import { URL } from "node:url";
import { randomBytes } from "node:crypto";
import { saveStoredCredential, type StoredCredential } from "./token-storage.js";
import { getOAuthCredentials } from "./oauth-config.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLOUDCODE_BASE_URL = "https://cloudcode-pa.googleapis.com";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/cclog",
  "https://www.googleapis.com/auth/experimentsandconfigs",
];

const REDIRECT_PORT = 11451;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;
const CALLBACK_TIMEOUT_MS = 2 * 60 * 1000;
const USER_AGENT = "antigravity";

type ProjectIdValue = string | { id?: string } | null | undefined;

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

interface LoadCodeAssistResponse {
  cloudaicompanionProject?: ProjectIdValue;
}

interface UserInfoResponse {
  email?: string;
}

export async function runOAuthFlow(): Promise<StoredCredential> {
  const state = randomBytes(16).toString("hex");
  const authUrl = await buildAuthorizationUrl(state);

  console.log("次のURLをブラウザで開いて認証してください:");
  console.log(authUrl);
  console.log(`localhost:${REDIRECT_PORT} でコールバック待機中...`);

  const code = await waitForAuthorizationCode(state);
  const tokenData = await exchangeAuthorizationCode(code);

  const accessToken = tokenData.accessToken;
  const projectId = await resolveProjectId(accessToken);
  const email = await fetchUserEmail(accessToken).catch(() => undefined);

  const credential: StoredCredential = {
    accessToken,
    refreshToken: tokenData.refreshToken,
    expiresAt: tokenData.expiresAt,
    projectId,
    email,
  };

  await saveStoredCredential(credential);
  return credential;
}

async function buildAuthorizationUrl(state: string): Promise<string> {
  const { clientId } = await getOAuthCredentials();
  
  // URLSearchParamsが自動的にエンコード処理を行うため、ここではraw値を渡す
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}

function waitForAuthorizationCode(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url ?? "", REDIRECT_URI);
      const code = requestUrl.searchParams.get("code");
      const state = requestUrl.searchParams.get("state");

      if (!code) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("認証コードが見つかりませんでした。");
        return;
      }

      if (state !== expectedState) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("state が一致しませんでした。");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<h1>認証が完了しました</h1><p>このウィンドウを閉じてください。</p>"
      );
      cleanup();
      resolve(code);
    });

    const cleanup = () => {
      clearTimeout(timeoutId);
      server.close();
    };

    server.on("error", (error) => {
      cleanup();
      reject(error);
    });

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("認証がタイムアウトしました。"));
    }, CALLBACK_TIMEOUT_MS);

    server.listen(REDIRECT_PORT);
  });
}

async function exchangeAuthorizationCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}> {
  const { clientId, clientSecret } = await getOAuthCredentials();
  
  // URLSearchParamsが自動的にエンコード処理を行うため、ここではraw値を渡す
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `アクセストークン取得に失敗しました: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as TokenResponse;
  if (!data.access_token || !data.refresh_token || !data.expires_in) {
    throw new Error("トークン情報が不足しています。");
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  };
}

async function resolveProjectId(accessToken: string): Promise<string | undefined> {
  const response = await fetch(`${CLOUDCODE_BASE_URL}/v1internal:loadCodeAssist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metadata: {
        ideType: "ANTIGRAVITY",
        platform: "PLATFORM_UNSPECIFIED",
        pluginType: "GEMINI",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `プロジェクトIDの取得に失敗しました: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as LoadCodeAssistResponse;
  const project = data.cloudaicompanionProject;
  if (typeof project === "string") {
    return project;
  }

  if (project && typeof project === "object" && project.id) {
    return project.id;
  }

  return undefined;
}

async function fetchUserEmail(accessToken: string): Promise<string | undefined> {
  const response = await fetch(USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ユーザー情報の取得に失敗しました: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as UserInfoResponse;
  return typeof data.email === "string" ? data.email : undefined;
}
