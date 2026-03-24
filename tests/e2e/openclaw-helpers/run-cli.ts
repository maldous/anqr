import { execSync } from "node:child_process";

export function runCli(args: string, timeoutMs = 15_000): string {
  return execSync(`openclaw ${args}`, {
    timeout: timeoutMs,
    encoding: "utf-8",
    env: { ...process.env, NO_COLOR: "1" },
  }).trim();
}
