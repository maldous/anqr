// Generated from ../../../scripts/ops/reporting/harness-report.mjs:245

import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function checkAstDensity() {
  try {
    const output = execFileSync("node", ["harness/audit-ast-density.mjs", "--threshold", "1"], {
      cwd: ROOT,
      timeout: 120_000,
      stdio: "pipe",
      encoding: "utf-8",
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    if (output.trim().length === 0) {
      return {
        pass: true,
        detail: "All files within density threshold (≤1 top-level declaration)",
      };
    }
    const lines = output.trim().split("\n");
    const fileSummary = lines
      .slice(0, 5)
      .map((l) => l.trim().split(/\s+/)[1])
      .join(", ");
    const suffix = lines.length > 5 ? ` ... and ${lines.length - 5} more` : "";
    return {
      pass: false,
      detail: `${lines.length} files exceed density threshold: ${fileSummary}${suffix}`,
    };
  } catch (err) {
    const stderr = (err.stderr || "").toString().trim();
    return { pass: false, detail: `AST density audit error: ${stderr.slice(0, 500)}` };
  }
}
