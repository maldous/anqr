import { execSync } from "node:child_process";

export function git(args, cwd) {
  return execSync(`git ${args}`, { encoding: "utf-8", cwd, timeout: 30000 }).trim();
}
