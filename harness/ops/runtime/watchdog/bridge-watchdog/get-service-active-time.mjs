// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:139

import { execSync } from "node:child_process";

export function getServiceActiveTime(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=ActiveEnterTimestamp --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 },
    );
    const timestamp = output.trim();
    if (!timestamp || timestamp === "0") return null;
    return new Date(timestamp);
  } catch {
    return null;
  }
}
