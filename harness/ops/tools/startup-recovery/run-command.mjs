// Generated from ../../../scripts/ops/tools/startup-recovery.mjs:30

import { execFileSync } from "node:child_process";

export function runCommand(cmd, args = [], cwd = process.cwd()) {
  try {
    const output = execFileSync(cmd, args, {
      encoding: "utf-8",
      cwd,
      stdio: "pipe",
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr?.toString?.() };
  }
}
