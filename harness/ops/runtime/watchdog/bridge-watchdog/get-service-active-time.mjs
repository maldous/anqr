import { execSync } from "node:child_process";

export function getServiceActiveTime(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=ActiveEnterTimestamp --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 },
    );
    const timestamp = output.trim();
    if (!timestamp || timestamp === "0") return null;
    const date = new Date(timestamp);
    // systemd timestamps (e.g. "Thu 2026-04-16 21:40:25 AEST") are not
    // reliably parsed by the JS Date constructor — return null if invalid.
    if (Number.isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}
