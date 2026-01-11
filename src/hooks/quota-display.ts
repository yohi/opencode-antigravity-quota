import type { PluginInput } from "@opencode-ai/plugin";
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

export function createQuotaDisplayHook(client: PluginInput["client"]) {
  return async (
    input: ToolExecuteInput,
    _output: ToolExecuteOutput
  ): Promise<void> => {
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

      const activeIndex = Math.max(
        0,
        Math.min(accounts.activeIndex, accounts.accounts.length - 1)
      );
      const activeAccount = accounts.accounts[activeIndex];
      if (!activeAccount) {
        return;
      }

      const quotas = parseRateLimits(activeAccount);
      const formatted = formatCompactQuotaStatus(quotas);
      client.tui.showToast({
        body: {
          message: formatted,
          variant: "info",
        },
      });
    } catch {
      return;
    }
  };
}
