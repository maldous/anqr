import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function checkReportsDir() {
  const reportsDir = resolve(ROOT, "reports");
  const codebuffDir = resolve(reportsDir, "codebuff");

  if (!existsSync(reportsDir)) {
    return { pass: false, detail: "reports/ directory missing" };
  }

  let latestRun = null;
  if (existsSync(codebuffDir)) {
    const files = execFileSync("ls", ["-t", codebuffDir], { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter((f) => f.startsWith("latest-"));
    if (files.length > 0) {
      const latestFile = files[0];
      const stat = execFileSync("stat", ["-c", "%Y", resolve(codebuffDir, latestFile)], {
        encoding: "utf-8",
      });
      const mtime = Number.parseInt(stat.trim(), 10) * 1000;
      const hoursAgo = Math.floor((Date.now() - mtime) / (1000 * 60 * 60));
      latestRun = { file: latestFile, hoursAgo };
    }
  }

  return {
    pass: true,
    detail: latestRun
      ? `Last Codebuff run: ${latestRun.file} (${latestRun.hoursAgo}h ago)`
      : "No Codebuff runs recorded",
    latestRun,
  };
}
