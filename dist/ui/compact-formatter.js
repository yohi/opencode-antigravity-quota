const FAMILY_DISPLAY_NAMES = {
    claude: "Claude",
    "gemini-pro": "Pro",
    "gemini-flash": "Flash",
};
const DISPLAY_ORDER = ["claude", "gemini-pro", "gemini-flash"];
export function formatCompactQuotaStatus(quotas) {
    const parts = [];
    const maxLabelLength = Math.max(...DISPLAY_ORDER.map((family) => FAMILY_DISPLAY_NAMES[family].length));
    for (const family of DISPLAY_ORDER) {
        const info = quotas.get(family);
        const label = FAMILY_DISPLAY_NAMES[family].padEnd(maxLabelLength);
        parts.push(`${label}: ${formatQuotaIndicator(info)}`);
    }
    return `[AG]\n${parts.join("\n")}`;
}
function formatQuotaIndicator(info) {
    if (!info) {
        return "??";
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
        return "✅";
    }
    return "??";
}
function formatPercentage(value) {
    const percentage = Math.round(value);
    if (percentage <= 0) {
        return "🪫0%";
    }
    if (percentage <= 20) {
        return `${percentage}%⚠️`;
    }
    return `${percentage}%🔋`;
}
function formatResetDisplay(info) {
    if (info.resetTimeValid === false) {
        return "(↻??)";
    }
    if (info.timeUntilResetMs === undefined) {
        return "(↻??)";
    }
    const remaining = formatRemainingTime(info.timeUntilResetMs);
    return `(↻${remaining})`;
}
function shouldEmphasizeEmpty(value) {
    return Math.round(value) <= 0;
}
function formatRemainingTime(ms) {
    if (ms <= 0) {
        return "0m";
    }
    const minutesTotal = Math.ceil(ms / 60000);
    if (minutesTotal < 60) {
        return `${minutesTotal}m`;
    }
    const hours = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h${minutes}m`;
}
//# sourceMappingURL=compact-formatter.js.map