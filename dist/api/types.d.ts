import type { ModelFamily, ModelQuotaInfo } from "../core/types.js";
export interface BucketInfo {
    modelId?: string;
    remainingFraction?: number;
    resetTime?: string;
    tokenType?: string;
}
export interface RetrieveUserQuotaResponse {
    buckets?: BucketInfo[];
}
export interface AvailableModelInfo {
    displayName?: string;
    quotaInfo?: {
        remainingFraction?: number;
        resetTime?: string;
    };
}
export interface FetchAvailableModelsResponse {
    models?: Record<string, AvailableModelInfo>;
}
export interface QuotaCache {
    data: Map<ModelFamily, ModelQuotaInfo>;
    timestamp: number;
}
//# sourceMappingURL=types.d.ts.map