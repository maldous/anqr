import { spawnSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function checkCspellCoverage() {
  const result = spawnSync(
    "npx",
    ["cspell", "--no-progress", "src/**/*.{ts,tsx}", "harness/**/*.{mjs,js}", "docs/**/*.md"],
    {
      cwd: ROOT,
      timeout: 120_000,
      encoding: "utf-8",
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );
  const output = `${result.stdout || ""}${result.stderr || ""}`;

  if (result.status === 0) {
    const summaryMatch = output.match(/Files checked:\s*(\d+)/);
    const filesChecked = summaryMatch ? summaryMatch[1] : "?";
    return { pass: true, detail: `${filesChecked} files checked, 0 spelling issues` };
  }

  const summaryMatch = output.match(
    /Files checked:\s*(\d+)[\s\S]*?Issues found:\s*(\d+)\s*in\s*(\d+)/,
  );
  const filesChecked = summaryMatch ? summaryMatch[1] : "?";
  const issueCount = summaryMatch ? summaryMatch[2] : "?";
  const fileCount = summaryMatch ? summaryMatch[3] : "?";

  const wordMatches = [...output.matchAll(/Unknown word \(([^)]+)\)/g)];
  const uniqueWords = [...new Set(wordMatches.map((m) => m[1]))].sort();

  const wordSummary =
    uniqueWords.length <= 10
      ? uniqueWords.join(", ")
      : uniqueWords.slice(0, 10).join(", ") + ` ... and ${uniqueWords.length - 10} more`;

  return {
    pass: false,
    detail: `${issueCount} issues in ${fileCount}/${filesChecked} files. Unknown words: ${wordSummary}`,
  };
}
