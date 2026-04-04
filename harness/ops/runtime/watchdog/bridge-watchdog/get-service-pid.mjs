import { execSync } from "node:child_process";

export function getServicePID(serviceName) {
  try {
    const output = execSync(
      `systemctl --user show ${serviceName} --property=MainPID --value 2>&1 || true`,
      { encoding: "utf-8", timeout: 5000 },
    );
    const pid = Number.parseInt(output.trim());
    return pid > 0 ? pid : null;
  } catch {
    return null;
  }
}
