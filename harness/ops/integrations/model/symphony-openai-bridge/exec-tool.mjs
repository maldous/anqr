import { execSync } from "node:child_process";

import { resolveRequestDir } from "./resolve-request-dir.mjs";
import { logError } from "./logger.mjs";

export async function execTool({ command, cwd }) {
  try {
    const result = execSync(command, {
      cwd: resolveRequestDir(cwd),
      encoding: "utf-8",
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { output: result, exitCode: 0 };
  } catch (error) {
    logError(`execTool failed: ${error.message}`, { command: command?.slice(0, 100) });
    return {
      output: error.stdout || error.message,
      exitCode: error.status || 1,
      error: error.message,
    };
  }
}
