import type { ModelFamily, ModelQuotaInfo, AccountData } from "./types.js";

export function parseRateLimits(account: AccountData): Map<ModelFamily, ModelQuotaInfo> {
  const result = new Map<ModelFamily, ModelQuotaInfo>();
  const now = Date.now();

  const families: ModelFamily[] = ["claude", "gemini-flash", "gemini-pro"];
  for (const family of families) {
    result.set(family, { family, status: "available" });
  }

  const rateLimits = account.rateLimitResetTimes ?? {};
  for (const [key, resetTime] of Object.entries(rateLimits)) {
    const family = parseModelFamilyFromKey(key);
    if (!family) continue;

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

function parseModelFamilyFromKey(key: string): ModelFamily | null {
  const lower = key.toLowerCase();

  if (lower.includes("claude")) {
    return "claude";
  }

  if (lower.includes("flash")) {
    return "gemini-flash";
  }

  if (lower.includes("gemini") || lower.includes("pro")) {
    return "gemini-pro";
  }

  return null;
}
