import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { createQuotaDisplayHook } from "./hooks/quota-display.js";
import { loadAccounts } from "./core/accounts-reader.js";
import { parseRateLimits } from "./core/rate-limit-parser.js";
import { formatCompactQuotaStatus } from "./ui/compact-formatter.js";

const agStatusTool = tool({
  description: "Show Antigravity quota status for current account",
  args: {},
  execute: async (_args, _context) => {
    const accounts = await loadAccounts();
    if (!accounts || accounts.accounts.length === 0) {
      return "No Antigravity accounts found.";
    }

    const activeIndex = Math.max(
      0,
      Math.min(accounts.activeIndex, accounts.accounts.length - 1)
    );
    const activeAccount = accounts.accounts[activeIndex];
    if (!activeAccount) {
      return "No active account selected.";
    }

    const quotas = parseRateLimits(activeAccount);
    return formatCompactQuotaStatus(quotas);
  },
});

const AntigravityQuotaPlugin: Plugin = async () => {
  const quotaDisplay = createQuotaDisplayHook();

  return {
    "tool.execute.after": quotaDisplay["tool.execute.after"],
    tool: {
      "ag-status": agStatusTool,
    },
  };
};

export default AntigravityQuotaPlugin;

