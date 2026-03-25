/**
 * update-memory.mjs — Shared utility for updating MEMORY.md
 * 
 * Centralizes MEMORY.md updates to prevent duplication across:
 * - Symphony bridge
 * - Codebuff bridge  
 * - Watchdog services
 * - Other operational scripts
 */

import { appendFile } from "node:fs/promises";
import path from "node:path";

/**
 * Append a timestamped note to MEMORY.md
 * @param {string} note - The note to append (without timestamp/formatting)
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {Promise<void>}
 */
export async function updateMemory(note, cwd = process.cwd()) {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `\n### ${timestamp} - ${note}\n`;
  try {
    await appendFile(path.join(cwd, "MEMORY.md"), entry);
    console.log(`[update-memory] 📝 Updated MEMORY.md: ${note}`);
  } catch (err) {
    console.log(`[update-memory] ⚠️ Failed to update MEMORY.md: ${err.message}`);
  }
}
