import { loadAccounts } from "../core/accounts-reader.js";
import { parseRateLimits } from "../core/rate-limit-parser.js";
import { formatCompactQuotaStatus } from "../ui/compact-formatter.js";
import { fetchQuotaWithCache } from "../api/quota-fetcher.js";
export function createQuotaDisplayHook(client) {
    return async (input, _output) => {
        try {
            if (!client?.tui?.showToast) {
                return;
            }
            if (input.tool === "ag-status") {
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
            const localQuotas = parseRateLimits(activeAccount);
            const apiQuotas = await fetchQuotaWithCache(activeAccount);
            // ローカルの情報をベースに、APIから取得できた情報があれば上書きマージする
            const quotas = new Map(localQuotas);
            if (apiQuotas) {
                for (const [family, info] of apiQuotas) {
                    quotas.set(family, info);
                }
            }
            const formatted = formatCompactQuotaStatus(quotas);
            client.tui.showToast({
                body: {
                    message: formatted,
                    variant: "info",
                },
            });
        }
        catch {
            return;
        }
    };
}
//# sourceMappingURL=quota-display.js.map