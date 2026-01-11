import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
}

const ENV_FILE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "antigravity-quota.env"
);

let cachedCredentials: OAuthCredentials | null = null;
let loadAttempted = false;

async function loadEnvFile(): Promise<void> {
  if (loadAttempted) {
    return;
  }
  loadAttempted = true;

  try {
    const content = await fs.readFile(ENV_FILE_PATH, "utf-8");
    const lines = content.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    }
  } catch {
  }
}

export async function getOAuthCredentials(): Promise<OAuthCredentials> {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  await loadEnvFile();

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      `OAuth credentials not found. Please create ${ENV_FILE_PATH} with OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET.`
    );
  }

  cachedCredentials = { clientId, clientSecret };
  return cachedCredentials;
}
