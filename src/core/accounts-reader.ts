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

const OH_MY_OPENCODE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "oh-my-opencode.jsonc"
);

function stripJsonComments(json: string): string {
  return json.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

export async function loadAccounts(): Promise<AntigravityAccountsFile | null> {
  // First, try to read from oh-my-opencode.jsonc
  try {
    const content = await fs.readFile(OH_MY_OPENCODE_PATH, "utf-8");
    const json = stripJsonComments(content);
    const data = JSON.parse(json);
    
    // Check if the file structure is directly the accounts file
    if (isValidAccountsFile(data)) {
        return data;
    }
    
    // Check if it's nested under "antigravity" property
    if (data && typeof data === 'object' && 'antigravity' in data) {
         const nested = (data as any).antigravity;
         if (isValidAccountsFile(nested)) {
             return nested;
         }
    }
  } catch (e) {
    // Ignore errors from missing file or parsing, proceed to fallback
  }

  // Fallback to original accounts file
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
