import { appendFile } from "node:fs/promises";
import path from "node:path";
import { logInfo, logWarn } from "./logger.mjs";

export async function updateMemory(note) {
  const timestamp = new Date().toISOString();
  const entry = `\n### ${timestamp} - ${note}\n`;
  try {
    await appendFile(path.join(process.cwd(), "MEMORY.md"), entry);
    logInfo(`[watchdog] 📝 Updated MEMORY.md: ${note}`);
  } catch (err) {
    logWarn(`[watchdog] ⚠️ Failed to update MEMORY.md: ${err.message}`);
  }
}
