import { refreshAccessToken } from "./oauth-client.js";
import { retrieveUserQuota } from "./cloudcode-client.js";
const CACHE_TTL_MS = 30_000;
let quotaCache = null;
const MODEL_FAMILIES = ["claude", "gemini-pro", "gemini-flash"];
export async function fetchQuotaWithCache(account) {
    const now = Date.now();
    if (quotaCache && now - quotaCache.timestamp < CACHE_TTL_MS) {
        return quotaCache.data;
    }
    let quotas = null;
    try {
        quotas = await fetchQuotaFromCloudCode(account);
    }
    catch {
        return null;
    }
    if (!quotas) {
        return null;
    }
    quotaCache = {
        data: quotas,
        timestamp: now,
    };
    return quotas;
}
async function fetchQuotaFromCloudCode(account) {
    if (!account.refreshToken) {
        return null;
    }
    const accessToken = await refreshAccessToken(account.refreshToken);
    const projectId = account.managedProjectId ?? account.projectId;
    const response = await retrieveUserQuota(accessToken, projectId);
    const result = new Map();
    // 以前はここで全モデルを available で初期化していたが、
    // ローカルデータとのマージを考慮して、APIに含まれるモデルのみを返すように変更
    const buckets = response.buckets ?? [];
    let hasPercentage = false;
    for (const bucket of buckets) {
        const family = resolveModelFamily(bucket.modelId ?? "");
        if (!family) {
            continue;
        }
        const remainingFraction = clampFraction(bucket.remainingFraction);
        if (remainingFraction === null) {
            continue;
        }
        const remainingPercentage = remainingFraction * 100;
        result.set(family, {
            family,
            status: remainingPercentage <= 0 ? "rate-limited" : "available",
            remainingPercentage,
        });
        hasPercentage = true;
    }
    return hasPercentage ? result : null;
}
function resolveModelFamily(modelId) {
    const lower = modelId.toLowerCase();
    if (lower.includes("claude")) {
        return "claude";
    }
    if (lower.includes("flash")) {
        return "gemini-flash";
    }
    if (lower.includes("pro")) {
        return "gemini-pro";
    }
    return null;
}
function clampFraction(value) {
    if (value === undefined || Number.isNaN(value)) {
        return null;
    }
    return Math.min(1, Math.max(0, value));
}
//# sourceMappingURL=quota-fetcher.js.map