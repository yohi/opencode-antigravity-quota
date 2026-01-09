"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAccounts = loadAccounts;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const ACCOUNTS_FILE_PATH = (0, node_path_1.join)((0, node_os_1.homedir)(), ".config", "opencode", "antigravity-accounts.json");
async function loadAccounts() {
    try {
        const content = await node_fs_1.promises.readFile(ACCOUNTS_FILE_PATH, "utf-8");
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