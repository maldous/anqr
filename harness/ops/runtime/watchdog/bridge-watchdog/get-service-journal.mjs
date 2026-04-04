import { execSync } from "node:child_process";

export function getServiceJournal(serviceName, lines = 50) {
  try {
    const output = execSync(
      `journalctl --user -u ${serviceName} -n ${lines} --no-pager 2>&1 || true`,
      { encoding: "utf-8", timeout: 10000 },
    );
    return output;
  } catch {
    return "";
  }
}
