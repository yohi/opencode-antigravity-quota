import { loadAccounts } from "../core/accounts-reader.js";
import { parseRateLimits } from "../core/rate-limit-parser.js";
import { formatCompactQuotaStatus } from "../ui/compact-formatter.js";

interface ToolExecuteInput {
  tool: string;
  sessionID: string;
  callID: string;
}

interface ToolExecuteOutput {
  title: string;
  output: string;
  metadata: unknown;
}

export function createQuotaDisplayHook() {
  return {
    "tool.execute.after": async (
      _input: ToolExecuteInput,
      output: ToolExecuteOutput
    ): Promise<void> => {
      try {
        const accounts = await loadAccounts();
        if (!accounts || accounts.accounts.length === 0) {
          return;
        }

        const activeIndex = Math.max(
          0,
          Math.min(accounts.activeIndex, accounts.accounts.length - 1)
        );
        const activeAccount = accounts.accounts[activeIndex];
        if (!activeAccount) {
          return;
        }

        const quotas = parseRateLimits(activeAccount);
        const hasAnyRateLimit = Array.from(quotas.values()).some(
          (q) => q.status === "rate-limited"
        );

        if (!hasAnyRateLimit) {
          return;
        }

        const formatted = formatCompactQuotaStatus(quotas);
        output.output += `\n\n${formatted}`;
      } catch {
        return;
      }
    },
  };
}
