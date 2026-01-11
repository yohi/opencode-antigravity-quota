const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        throw new Error("refreshToken がありません。");
    }
    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
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