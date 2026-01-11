import type { AccountData, ModelFamily, ModelQuotaInfo } from "../core/types.js";
import { refreshAccessToken } from "./oauth-client.js";
import { retrieveUserQuota } from "./cloudcode-client.js";
import type { BucketInfo, QuotaCache } from "./types.js";

const CACHE_TTL_MS = 30_000;
let quotaCache: QuotaCache | null = null;

const MODEL_FAMILIES: ModelFamily[] = ["claude", "gemini-pro", "gemini-flash"];

export async function fetchQuotaWithCache(
  account: AccountData
): Promise<Map<ModelFamily, ModelQuotaInfo> | null> {
  const now = Date.now();
  if (quotaCache && now - quotaCache.timestamp < CACHE_TTL_MS) {
    return quotaCache.data;
  }

  let quotas: Map<ModelFamily, ModelQuotaInfo> | null = null;
  try {
    quotas = await fetchQuotaFromCloudCode(account);
  } catch {
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

async function fetchQuotaFromCloudCode(
  account: AccountData
): Promise<Map<ModelFamily, ModelQuotaInfo> | null> {
  if (!account.refreshToken) {
    return null;
  }

  const accessToken = await refreshAccessToken(account.refreshToken);
  const projectId = account.managedProjectId ?? account.projectId;
  const response = await retrieveUserQuota(accessToken, projectId);

  const result = new Map<ModelFamily, ModelQuotaInfo>();
  for (const family of MODEL_FAMILIES) {
    result.set(family, { family, status: "available" });
  }

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

function resolveModelFamily(modelId: string): ModelFamily | null {
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

function clampFraction(value?: number): number | null {
  if (value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.min(1, Math.max(0, value));
}
