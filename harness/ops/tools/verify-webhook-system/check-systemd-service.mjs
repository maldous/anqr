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
