import { execFileSync } from "node:child_process";

export function getSystemdStatus(serviceName) {
  try {
    const output = execFileSync("systemctl", ["--user", "status", serviceName], {
      encoding: "utf-8",
    });
    return output;
  } catch (error) {
    return error.stdout || error.stderr || `Service ${serviceName} not found`;
  }
}
