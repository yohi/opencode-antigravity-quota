import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { log } from "../utils/logger.js";

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
}

// 複数の env ファイルパスを優先順位順に定義
const ENV_FILE_PATHS = [
  // 優先度1: ユーザー設定ディレクトリ (npm パッケージ推奨)
  join(homedir(), ".config", "opencode", "antigravity-quota.env"),
  // 優先度2: このファイルからの相対パス (ローカルクローン用)
  join(__dirname, "../..", ".env"),
];

let cachedCredentials: OAuthCredentials | null = null;
let loadPromise: Promise<void> | null = null;

async function loadEnvFile(): Promise<void> {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    // 各パスを優先順位順に試行
    for (const envPath of ENV_FILE_PATHS) {
      try {
        const content = await fs.readFile(envPath, "utf-8");
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
        
        // 成功したら終了
        return;
      } catch (error) {
        // ENOENT (file not found) is expected, log other errors
        if ((error as any).code !== "ENOENT") {
          await log(`Error reading env file at ${envPath}:`, error);
        }
        // このパスが失敗したら次のパスを試す
        continue;
      }
    }
  })();

  return loadPromise;
}

export async function getOAuthCredentials(): Promise<OAuthCredentials> {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  await loadEnvFile();

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const pathsMessage = ENV_FILE_PATHS.map((p) => `- ${p}`).join("\n");
    throw new Error(
      `OAuth credentials not found. Please create one of these files with OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET:\n${pathsMessage}`
    );
  }

  cachedCredentials = { clientId, clientSecret };
  return cachedCredentials;
}
