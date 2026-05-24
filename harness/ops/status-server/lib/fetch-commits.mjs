import { execFileSync } from "node:child_process";
import { REPO_ROOT } from "./constants.mjs";

export function fetchCommits() {
  try {
    const out = execFileSync(
      "git",
      [
        "log",
        "--max-count=20",
        "--format=%h|%s|%an|%ar|%ad",
        "--date=short",
        "--no-color",
      ],
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 5000 },
    );
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, subject, author, relative, date] = line.split("|");
        const m = /^(fix|feat|chore|docs|refactor|test|ci|build|perf|style|revert)[(:]/.exec(
          subject,
        );
        return { hash, subject, author, relative, date, type: m ? m[1] : "other" };
      });
  } catch {
    return [];
  }
}