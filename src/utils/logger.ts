import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const LOG_FILE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "antigravity-quota-debug.log"
);

let logDirCreated = false;

async function ensureLogDir(): Promise<void> {
  if (logDirCreated) {
    return;
  }
  try {
    await fs.mkdir(dirname(LOG_FILE_PATH), { recursive: true });
    logDirCreated = true;
  } catch {
    // Ignore directory creation errors, will fail at write time if critical
  }
}

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

async function rotateLogIfNeeded(): Promise<void> {
  try {
    const stats = await fs.stat(LOG_FILE_PATH);
    if (stats.size > MAX_LOG_SIZE) {
      // Rotate: rename old log to .old
      const oldPath = `${LOG_FILE_PATH}.old`;
      await fs.rename(LOG_FILE_PATH, oldPath).catch(() => {});
    }
  } catch {
    // Ignore errors if file doesn't exist
  }
}

export async function log(message: string, ...args: unknown[]): Promise<void> {
  try {
    await ensureLogDir();
    await rotateLogIfNeeded();
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return `Error: ${arg.message}\nStack: ${arg.stack}`;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, Object.getOwnPropertyNames(arg), 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    const logMessage = `[${timestamp}] ${message} ${formattedArgs}\n`;
    
    await fs.appendFile(LOG_FILE_PATH, logMessage, "utf-8");
  } catch {
  }
}

export async function clearLog(): Promise<void> {
  try {
    await ensureLogDir();
    await fs.writeFile(LOG_FILE_PATH, "", "utf-8");
  } catch {
  }
}

function maskIdentifier(value: string | undefined): string {
  if (!value) {
    return "[empty]";
  }
  if (value.length <= 8) {
    return "***";
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

interface SafeResponseSummary {
  status: string;
  modelCount?: number;
  bucketCount?: number;
  hasQuotaInfo?: boolean;
}

function sanitizeApiResponse(response: unknown): SafeResponseSummary {
  if (!response || typeof response !== 'object') {
    return { status: 'invalid' };
  }

  const obj = response as Record<string, unknown>;

  if ('models' in obj && typeof obj.models === 'object' && obj.models !== null) {
    const models = obj.models as Record<string, unknown>;
    const modelCount = Object.keys(models).length;
    const hasQuotaInfo = Object.values(models).some(
      (m) => typeof m === 'object' && m !== null && 'quotaInfo' in m
    );
    return { status: 'success', modelCount, hasQuotaInfo };
  }

  if ('buckets' in obj && Array.isArray(obj.buckets)) {
    return { 
      status: 'success', 
      bucketCount: obj.buckets.length 
    };
  }

  return { status: 'unknown' };
}

export { maskIdentifier, sanitizeApiResponse };
