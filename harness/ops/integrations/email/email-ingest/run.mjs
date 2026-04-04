import { spawnSync } from "node:child_process";

export function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: "utf-8",
    timeout: 60_000,
    stdio: "pipe",
    ...opts,
  });
}
