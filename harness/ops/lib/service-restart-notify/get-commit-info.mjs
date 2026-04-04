import { execSync } from "node:child_process";

export function getCommitInfo(cwd = process.cwd()) {
  try {
    const info = execSync('git log -1 --pretty=format:"%s%n%b"', {
      encoding: "utf-8",
      cwd,
      timeout: 5000,
    }).trim();
    const [subject, ...bodyLines] = info.split("\n");
    const body = bodyLines.join("\n").trim();
    return { subject, body };
  } catch {
    return { subject: "unknown", body: "" };
  }
}
