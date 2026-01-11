import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const AUTH_FILE_PATH = join(homedir(), ".config", "opencode", "antigravity-auth.json");
export async function loadStoredCredential() {
    try {
        const content = await fs.readFile(AUTH_FILE_PATH, "utf-8");
        const data = JSON.parse(content);
        if (!data.accessToken || !data.refreshToken || !data.expiresAt) {
            return null;
        }
        return data;
    }
    catch {
        return null;
    }
}
export async function saveStoredCredential(credential) {
    const dir = join(homedir(), ".config", "opencode");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AUTH_FILE_PATH, JSON.stringify(credential, null, 2), "utf-8");
}
export async function deleteStoredCredential() {
    try {
        await fs.unlink(AUTH_FILE_PATH);
    }
    catch {
        // ignore if file doesn't exist
    }
}
export function isAccessTokenValid(credential) {
    const expiresAt = new Date(credential.expiresAt);
    const now = new Date();
    const bufferBeforeExpiryMs = 5 * 60 * 1000;
    return expiresAt.getTime() - now.getTime() > bufferBeforeExpiryMs;
}
//# sourceMappingURL=token-storage.js.map