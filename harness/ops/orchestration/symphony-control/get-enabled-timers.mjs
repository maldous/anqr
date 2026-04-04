import { execFileSync } from "node:child_process";

export function getEnabledTimers() {
  try {
    const output = execFileSync(
      "systemctl",
      ["--user", "list-timers", "anqr-linear-runner@*.timer", "--all", "--no-legend"],
      { encoding: "utf-8" },
    );
    const lines = output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return lines
      .map((line) => line.split(/\s+/).slice(-2, -1)[0])
      .filter((unit) => unit?.startsWith("anqr-linear-runner@"));
  } catch {
    return [];
  }
}
