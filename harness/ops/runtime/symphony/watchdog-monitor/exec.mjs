import { execSync } from "node:child_process";

export function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", ...opts }).trim();
  } catch {
    return null;
  }
}
