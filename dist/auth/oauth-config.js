export function getOAuthCredentials() {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("OAuth credentials not found. Please set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET environment variables.");
    }
    return { clientId, clientSecret };
}
//# sourceMappingURL=oauth-config.js.map