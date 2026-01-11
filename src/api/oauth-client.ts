import { getOAuthCredentials } from "../auth/oauth-config.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface RefreshTokenResponse {
  access_token?: string;
  expires_in?: number;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!refreshToken) {
    throw new Error("refreshToken がありません。");
  }

  const { clientId, clientSecret } = await getOAuthCredentials();

  // RFC 6749 Section 2.3.1: クライアント認証情報はURL-encodeする必要がある
  // URLSearchParamsは自動的にエンコードするが、明示的に行うことで仕様への準拠を保証
  const encodedClientId = encodeURIComponent(clientId);
  const encodedClientSecret = encodeURIComponent(clientSecret);
  const encodedRefreshToken = encodeURIComponent(refreshToken);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: encodedClientId,
      client_secret: encodedClientSecret,
      refresh_token: encodedRefreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const lowered = errorText.toLowerCase();
    if (lowered.includes("invalid_grant")) {
      throw new Error("refreshToken が無効です。");
    }
    throw new Error(
      `アクセストークン取得に失敗しました: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as RefreshTokenResponse;
  if (!data.access_token) {
    throw new Error("アクセストークンが取得できませんでした。");
  }

  return data.access_token;
}
