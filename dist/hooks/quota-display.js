"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuotaDisplayHook = createQuotaDisplayHook;
const accounts_reader_js_1 = require("../core/accounts-reader.js");
const rate_limit_parser_js_1 = require("../core/rate-limit-parser.js");
const compact_formatter_js_1 = require("../ui/compact-formatter.js");
function createQuotaDisplayHook() {
    return {
        "tool.execute.after": async (_input, output) => {
            try {
                const accounts = await (0, accounts_reader_js_1.loadAccounts)();
                if (!accounts || accounts.accounts.length === 0) {
                    return;
                }
                const activeIndex = Math.max(0, Math.min(accounts.activeIndex, accounts.accounts.length - 1));
                const activeAccount = accounts.accounts[activeIndex];
                if (!activeAccount) {
                    return;
                }
                const quotas = (0, rate_limit_parser_js_1.parseRateLimits)(activeAccount);
                const hasAnyRateLimit = Array.from(quotas.values()).some((q) => q.status === "rate-limited");
                if (!hasAnyRateLimit) {
                    return;
                }
                const formatted = (0, compact_formatter_js_1.formatCompactQuotaStatus)(quotas);
                output.output += `\n\n${formatted}`;
            }
            catch {
                return;
            }
        },
    };
}
//# sourceMappingURL=quota-display.js.map