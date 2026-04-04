// Generated from ../../../scripts/ops/tools/verify-webhook-system.mjs:25

import { execFileSync } from "node:child_process";

export function checkSystemdService(serviceName) {
  try {
    const output = execFileSync("systemctl", ["--user", "is-active", serviceName], {
      encoding: "utf-8",
    });
    return output.trim() === "active";
  } catch {
    return false;
  }
}
