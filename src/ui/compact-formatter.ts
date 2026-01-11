import type { ModelFamily, ModelQuotaInfo } from "../core/types.js";

const FAMILY_DISPLAY_NAMES: Record<ModelFamily, string> = {
  claude: "Claude",
  "gemini-pro": "Pro",
  "gemini-flash": "Flash",
};

const DISPLAY_ORDER: ModelFamily[] = ["claude", "gemini-pro", "gemini-flash"];

export function formatCompactQuotaStatus(
  quotas: Map<ModelFamily, ModelQuotaInfo>
): string {
  const parts: string[] = [];
  const maxLabelLength = Math.max(
    ...DISPLAY_ORDER.map((family) => FAMILY_DISPLAY_NAMES[family].length)
  );

  for (const family of DISPLAY_ORDER) {
    const info = quotas.get(family);
    const label = FAMILY_DISPLAY_NAMES[family].padEnd(maxLabelLength);
    parts.push(`${label}: ${formatQuotaIndicator(info)}`);
  }

  return `[AG]\n${parts.join("\n")}`;
}

function formatQuotaIndicator(info?: ModelQuotaInfo): string {
  if (!info) {
    return "  ??   ";
  }

  if (info.remainingPercentage !== undefined) {
    const percentageDisplay = formatPercentage(info.remainingPercentage);
    const resetDisplay = formatResetDisplay(info);
    const emphasis = shouldEmphasizeEmpty(info.remainingPercentage) ? "⚡" : "";
    return `${percentageDisplay}${resetDisplay}${emphasis}`;
  }

  if (info.status === "rate-limited") {
    const remaining = formatRemainingTime(info.remainingMs ?? 0);
    return `⏳${remaining}`;
  }

  if (info.status === "available") {
    return "  OK   ";
  }

  return "  ??   ";
}

function formatPercentage(value: number): string {
  const percentage = Math.round(value);
  const paddedPercentage = String(percentage).padStart(3);

  if (percentage <= 0) {
    return `🪫  0%`;
  }

  if (percentage <= 20) {
    return `${paddedPercentage}%⚠️`;
  }

  return `${paddedPercentage}%🔋`;
}

function formatResetDisplay(info: ModelQuotaInfo): string {
  if (info.resetTimeValid === true && info.timeUntilResetMs !== undefined) {
    const remaining = formatRemainingTime(info.timeUntilResetMs);
    return `(↻${remaining})`;
  }

  return "";
}

function shouldEmphasizeEmpty(value: number): boolean {
  return Math.round(value) <= 0;
}

function formatRemainingTime(ms: number): string {
  if (ms <= 0) {
    return "  0m";
  }

  const minutesTotal = Math.ceil(ms / 60000);

  if (minutesTotal < 60) {
    return `${String(minutesTotal).padStart(3)}m`;
  }

  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;

  if (minutes === 0) {
    return `${String(hours).padStart(2)}h  `;
  }

  return `${String(hours).padStart(2)}h${String(minutes).padStart(2)}m`;
}
