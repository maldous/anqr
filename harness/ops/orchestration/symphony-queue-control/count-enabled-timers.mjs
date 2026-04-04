// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:76

import { execFileSync } from "node:child_process";

export function countEnabledTimers() {
  try {
    const output = execFileSync(
      "systemctl",
      [
        "--user",
        "list-unit-files",
        "anqr-symphony-runner@*.timer",
        "--state=enabled",
        "--no-legend",
      ],
      { encoding: "utf-8" },
    );
    const lines = output.trim().split("\n").filter(Boolean);
    return lines.length;
  } catch {
    // If systemctl fails or no timers found, return 0
    return 0;
  }
}
