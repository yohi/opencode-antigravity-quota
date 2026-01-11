import { loadAccounts } from "../core/accounts-reader.js";
import { parseRateLimits } from "../core/rate-limit-parser.js";
import { formatCompactQuotaStatus } from "../ui/compact-formatter.js";
export function createQuotaDisplayHook(client) {
    return async (input, _output) => {
        try {
            if (!client?.tui?.showToast) {
                return;
            }
            const accounts = await loadAccounts();
            if (!accounts || accounts.accounts.length === 0) {
                return;
            }
            const activeIndex = Math.max(0, Math.min(accounts.activeIndex, accounts.accounts.length - 1));
            const activeAccount = accounts.accounts[activeIndex];
            if (!activeAccount) {
                return;
            }
            const quotas = parseRateLimits(activeAccount);
            const formatted = formatCompactQuotaStatus(quotas);
            await client.tui.showToast({
                body: {
                    title: "Antigravity",
                    message: formatted,
                    variant: "info",
                    duration: 4000,
                },
            });
        }
        catch {
            return;
        }
    };
}
//# sourceMappingURL=quota-display.js.map