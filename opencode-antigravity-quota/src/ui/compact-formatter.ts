import type { ModelQuotaInfo, ModelFamily } from "../core/types.js";

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

  for (const family of DISPLAY_ORDER) {
    const info = quotas.get(family);
    const label = FAMILY_DISPLAY_NAMES[family];

    if (!info || info.status === "available") {
      parts.push(`${label}:✅`);
    } else {
      const remaining = formatRemainingTime(info.remainingMs ?? 0);
      parts.push(`${label}:⏳${remaining}`);
    }
  }

  return `[AG] ${parts.join(" | ")}`;
}

function formatRemainingTime(ms: number): string {
  if (ms <= 0) {
    return "0m";
  }

  const totalMinutes = Math.ceil(ms / 60000);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${minutes}m`;
}
