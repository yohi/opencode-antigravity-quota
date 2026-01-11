import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const ACCOUNTS_FILE_PATH = join(homedir(), ".config", "opencode", "antigravity-accounts.json");
export async function loadAccounts() {
    try {
        const content = await fs.readFile(ACCOUNTS_FILE_PATH, "utf-8");
        const data = JSON.parse(content);
        if (!isValidAccountsFile(data)) {
            return null;
        }
        return data;
    }
    catch {
        return null;
    }
}
function isValidAccountsFile(data) {
    if (typeof data !== "object" || data === null) {
        return false;
    }
    const obj = data;
    return (typeof obj.version === "number" &&
        Array.isArray(obj.accounts) &&
        obj.accounts.every((account) => typeof account === "object" &&
            account !== null &&
            "rateLimitResetTimes" in account &&
            typeof account.rateLimitResetTimes !== "undefined") &&
        typeof obj.activeIndex === "number");
}
//# sourceMappingURL=accounts-reader.js.map