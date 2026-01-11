export const MODEL_FAMILIES = ["claude", "gemini-flash", "gemini-pro"] as const;
export type ModelFamily = (typeof MODEL_FAMILIES)[number];

export type QuotaStatus = "available" | "rate-limited";

export interface ModelQuotaInfo {
  family: ModelFamily;
  status: QuotaStatus;
  remainingPercentage?: number;
  resetTimeMs?: number;
  remainingMs?: number;
}

export interface AccountData {
  email: string;
  refreshToken: string;
  projectId: string;
  managedProjectId?: string;
  addedAt: number;
  lastUsed: number;
  rateLimitResetTimes: Record<string, number>;
}

export interface AntigravityAccountsFile {
  version: number;
  accounts: AccountData[];
  activeIndex: number;
  activeIndexByFamily?: Record<string, number>;
}

export interface QuotaPluginConfig {
  displayFormat: "compact" | "detailed";
  showOnAllTools: boolean;
}
