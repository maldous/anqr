import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { cwd } from "./cwd.mjs";
import { ROOT } from "./root.mjs";

export const gitPath = resolve(cwd, ".git");

export function gitMetadataPath(path) {
  return execFileSync("git", ["rev-parse", "--git-path", path], {
    cwd: ROOT,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}
