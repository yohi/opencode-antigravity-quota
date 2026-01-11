import type { AccountData, ModelFamily, ModelQuotaInfo } from "../core/types.js";
import { refreshAccessToken } from "./oauth-client.js";
import { fetchAvailableModels, retrieveUserQuota } from "./cloudcode-client.js";
import {
  isAccessTokenValid,
  loadStoredCredential,
  saveStoredCredential,
} from "../auth/token-storage.js";
import { FetchAvailableModelsResponse, QuotaCache } from "./types.js";


const CACHE_TTL_MS = 30_000;
let quotaCache: QuotaCache | null = null;

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
  const storedCredential = await loadStoredCredential();
  const userAccessToken = await resolveAccessToken(storedCredential);

  if (userAccessToken) {
    const projectId = storedCredential?.projectId;
    const response = await fetchAvailableModels(userAccessToken, projectId);
    const quotas = extractQuotaFromAvailableModels(response);
    if (quotas && quotas.size > 0) {
      return quotas;
    }
  }

  if (!account.refreshToken) {
    return null;
  }

  const accessToken = await refreshAccessToken(account.refreshToken);
  const projectId = account.managedProjectId ?? account.projectId;
  const response = await retrieveUserQuota(accessToken, projectId);

  const result = new Map<ModelFamily, ModelQuotaInfo>();
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

async function resolveAccessToken(
  credential: Awaited<ReturnType<typeof loadStoredCredential>>
): Promise<string | null> {
  if (!credential) {
    return null;
  }

  if (isAccessTokenValid(credential)) {
    return credential.accessToken;
  }

  if (!credential.refreshToken) {
    return null;
  }

  const refreshed = await refreshAccessToken(credential.refreshToken);
  const expiresAt = new Date(Date.now() + 55 * 60 * 1000).toISOString();
  await saveStoredCredential({
    ...credential,
    accessToken: refreshed,
    expiresAt,
  });

  return refreshed;
}

function extractQuotaFromAvailableModels(
  response: FetchAvailableModelsResponse
): Map<ModelFamily, ModelQuotaInfo> | null {
  const models = response.models ?? {};
  const result = new Map<ModelFamily, ModelQuotaInfo>();

  for (const [modelId, info] of Object.entries(models)) {
    const family = resolveModelFamily(modelId);
    if (!family) {
      continue;
    }

    const remainingFraction = clampFraction(info.quotaInfo?.remainingFraction);
    if (remainingFraction === null) {
      continue;
    }

    const remainingPercentage = remainingFraction * 100;
    result.set(family, {
      family,
      status: remainingPercentage <= 0 ? "rate-limited" : "available",
      remainingPercentage,
    });
  }

  return result.size > 0 ? result : null;
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
