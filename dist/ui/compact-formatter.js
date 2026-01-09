"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCompactQuotaStatus = formatCompactQuotaStatus;
const FAMILY_DISPLAY_NAMES = {
    claude: "Claude",
    "gemini-pro": "Pro",
    "gemini-flash": "Flash",
};
const DISPLAY_ORDER = ["claude", "gemini-pro", "gemini-flash"];
function formatCompactQuotaStatus(quotas) {
    const parts = [];
    for (const family of DISPLAY_ORDER) {
        const info = quotas.get(family);
        const label = FAMILY_DISPLAY_NAMES[family];
        if (!info || info.status === "available") {
            parts.push(`${label}:✅`);
        }
        else {
            const remaining = formatRemainingTime(info.remainingMs ?? 0);
            parts.push(`${label}:⏳${remaining}`);
        }
    }
    return `[AG] ${parts.join(" | ")}`;
}
function formatRemainingTime(ms) {
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
//# sourceMappingURL=compact-formatter.js.map