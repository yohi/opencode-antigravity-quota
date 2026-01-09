import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { AntigravityAccountsFile } from "./types.js";

const ACCOUNTS_FILE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "antigravity-accounts.json"
);

export async function loadAccounts(): Promise<AntigravityAccountsFile | null> {
  try {
    const content = await fs.readFile(ACCOUNTS_FILE_PATH, "utf-8");
    const data = JSON.parse(content) as AntigravityAccountsFile;

    if (!isValidAccountsFile(data)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function isValidAccountsFile(data: unknown): data is AntigravityAccountsFile {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === "number" &&
    Array.isArray(obj.accounts) &&
    obj.accounts.every(
      (account) =>
        typeof account === "object" &&
        account !== null &&
        "rateLimitResetTimes" in account &&
        typeof (account as Record<string, unknown>).rateLimitResetTimes !== "undefined"
    ) &&
    typeof obj.activeIndex === "number"
  );
}
