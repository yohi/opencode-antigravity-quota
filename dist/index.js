import { tool } from "@opencode-ai/plugin/tool";
import { createQuotaDisplayHook } from "./hooks/quota-display.js";
import { loadAccounts } from "./core/accounts-reader.js";
import { parseRateLimits } from "./core/rate-limit-parser.js";
import { formatCompactQuotaStatus } from "./ui/compact-formatter.js";
const agStatusTool = tool({
    description: "Show Antigravity quota status for current account",
    args: {},
    execute: async (_args, _context) => {
        try {
            const accounts = await loadAccounts();
            if (!accounts || accounts.accounts.length === 0) {
                return "No Antigravity accounts found.";
            }
            const activeIndex = Math.max(0, Math.min(accounts.activeIndex, accounts.accounts.length - 1));
            const activeAccount = accounts.accounts[activeIndex];
            if (!activeAccount) {
                return "No active account selected.";
            }
            const quotas = parseRateLimits(activeAccount);
            return formatCompactQuotaStatus(quotas);
        }
        catch (error) {
            console.error("Failed to retrieve Antigravity quota status", error);
            const errorDetail = error instanceof Error && error.message ? `: ${error.message}` : "";
            return `Failed to retrieve Antigravity quota status${errorDetail}`;
        }
    },
});
const AntigravityQuotaPlugin = async ({ client }) => {
    const quotaDisplay = createQuotaDisplayHook(client);
    return {
        "tool.execute.after": quotaDisplay,
        tool: {
            "ag-status": agStatusTool,
        },
    };
};
export default AntigravityQuotaPlugin;
//# sourceMappingURL=index.js.map