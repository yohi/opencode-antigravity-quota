"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRateLimits = parseRateLimits;
function parseRateLimits(account) {
    const result = new Map();
    const now = Date.now();
    const families = ["claude", "gemini-flash", "gemini-pro"];
    for (const family of families) {
        result.set(family, { family, status: "available" });
    }
    const rateLimits = account.rateLimitResetTimes ?? {};
    for (const [key, resetTime] of Object.entries(rateLimits)) {
        const family = parseModelFamilyFromKey(key);
        if (!family)
            continue;
        const remainingMs = resetTime - now;
        if (remainingMs > 0) {
            result.set(family, {
                family,
                status: "rate-limited",
                resetTimeMs: resetTime,
                remainingMs,
            });
        }
    }
    return result;
}
function parseModelFamilyFromKey(key) {
    const lower = key.toLowerCase();
    if (lower.includes("claude")) {
        return "claude";
    }
    if (lower.includes("flash")) {
        return "gemini-flash";
    }
    if (lower.includes("gemini-pro") || (lower.includes("gemini") && lower.includes("pro"))) {
        return "gemini-pro";
    }
    return null;
}
//# sourceMappingURL=rate-limit-parser.js.map