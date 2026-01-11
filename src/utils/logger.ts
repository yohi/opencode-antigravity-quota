import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const LOG_FILE_PATH = join(
  homedir(),
  ".config",
  "opencode",
  "antigravity-quota-debug.log"
);

export async function log(message: string, ...args: unknown[]): Promise<void> {
  try {
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
    await fs.writeFile(LOG_FILE_PATH, "", "utf-8");
  } catch {
  }
}
