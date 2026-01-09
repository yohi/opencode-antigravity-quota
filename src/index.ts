import type { Plugin } from "@opencode-ai/plugin";
import { createQuotaDisplayHook } from "./hooks/quota-display.js";

const AntigravityQuotaPlugin: Plugin = async () => {
  const quotaDisplay = createQuotaDisplayHook();

  return {
    "tool.execute.after": quotaDisplay["tool.execute.after"],
  };
};

export default AntigravityQuotaPlugin;
