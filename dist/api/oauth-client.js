import { getOAuthCredentials } from "../auth/oauth-config.js";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("refreshToken がありません。");
    }
    const { clientId, clientSecret } = getOAuthCredentials();
    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }).toString(),
    });
    if (!response.ok) {
        const errorText = await response.text();
        const lowered = errorText.toLowerCase();
        if (lowered.includes("invalid_grant")) {
            throw new Error("refreshToken が無効です。");
        }
        throw new Error(`アクセストークン取得に失敗しました: ${response.status} - ${errorText}`);
    }
    const data = (await response.json());
    if (!data.access_token) {
        throw new Error("アクセストークンが取得できませんでした。");
    }
    return data.access_token;
}
//# sourceMappingURL=oauth-client.js.map