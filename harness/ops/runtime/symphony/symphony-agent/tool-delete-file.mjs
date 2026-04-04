// Generated from ../../../../harness/ops/runtime/symphony/symphony-agent.mjs:253

import { relative } from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, statSync, unlinkSync, rmSync } from "node:fs";

import { validatePath } from "./validate-path.mjs";

export function toolDeleteFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  const rel = relative(projectRoot, fullPath);

  // Guard: never delete the project root itself
  if (!rel || rel === ".") {
    return "Error: Cannot delete the project root.";
  }

  // Guard: must be inside a git working tree
  try {
    const gitRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (!fullPath.startsWith(gitRoot + "/") && fullPath !== gitRoot) {
      return `Error: Path is outside the git repository: ${args.path}`;
    }
  } catch {
    return "Error: Not inside a git repository — delete_file is disabled.";
  }

  // Guard: block deletion of top-level directories (e.g. src/, harness/, docs/)
  const depth = rel.split("/").length;
  if (depth === 1 && existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    return `Error: Cannot delete top-level directory "${rel}/". Delete its contents individually instead.`;
  }

  if (!existsSync(fullPath)) {
    return `Error: Not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    try {
      rmSync(fullPath, { recursive: true });
      return `Deleted directory: ${args.path}`;
    } catch (err) {
      return `Error: Could not delete directory ${args.path}: ${err.message}`;
    }
  }
  unlinkSync(fullPath);
  return `Deleted: ${args.path}`;
}
