import { execSync } from "node:child_process";

export function getServiceStatus(serviceName) {
  try {
    const output = execSync(`systemctl --user is-active ${serviceName} 2>&1 || true`, {
      encoding: "utf-8",
      timeout: 5000,
    });
    return output.trim();
  } catch {
    return "unknown";
  }
}
