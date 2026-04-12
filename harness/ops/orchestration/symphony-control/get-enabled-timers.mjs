import { execFileSync } from "node:child_process";

const LINEAR_SERVICES = [
  "anqr-linear-reconciler.service",
  "anqr-symphony-executor@1.service",
  "anqr-symphony-executor@2.service",
  "anqr-symphony-executor@3.service",
  "anqr-symphony-executor@4.service",
];

export function getEnabledTimers() {
  const enabled = [];
  for (const unit of LINEAR_SERVICES) {
    try {
      const output = execFileSync("systemctl", ["--user", "is-enabled", unit], {
        encoding: "utf-8",
      }).trim();
      if (output === "enabled") enabled.push(unit);
    } catch {
      /* unit not enabled or not found */
    }
  }
  return enabled;
}
