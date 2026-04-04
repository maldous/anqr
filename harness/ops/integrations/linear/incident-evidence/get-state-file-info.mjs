import { existsSync, statSync } from "node:fs";

export function getStateFileInfo() {
  try {
    const stateDir =
      process.env.ANQR_SYMPHONY_STATE_DIR ||
      `${process.env.XDG_RUNTIME_DIR || "/tmp"}/anqr-symphony-state`;
    const stateFile = `${stateDir}/state.json`;

    if (existsSync(stateFile)) {
      const stats = statSync(stateFile);
      return {
        size: `${Math.round(stats.size / 1024)} KB`,
        modified: stats.mtime.toISOString(),
      };
    }
  } catch {
    // Ignore errors
  }
  return null;
}
