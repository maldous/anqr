import * as imports from "./imports.mjs";

// 10 = "this file is doing too many distinct things". Threshold 1 (the
// original) forced state modules and barrel files into per-symbol shards
// and was the proximate cause of the empty-file fiasco in acfc052c2.
const THRESHOLD = 10;

function summarize(output) {
  const lines = output.trim().split("\n").filter(Boolean);
  if (lines.length === 0) {
    return {
      pass: true,
      detail: `All files within density threshold (≤${THRESHOLD} top-level declarations)`,
    };
  }
  const fileSummary = lines
    .slice(0, 5)
    .map((l) => l.trim().split(/\s+/)[1])
    .join(", ");
  const suffix = lines.length > 5 ? ` ... and ${lines.length - 5} more` : "";
  return {
    pass: false,
    detail: `${lines.length} files exceed density threshold: ${fileSummary}${suffix}`,
  };
}

export function checkAstDensity() {
  try {
    // The audit writes its violation list to stdout and exits 1 when any
    // file exceeds the threshold. execFileSync throws on non-zero exit, so
    // a "found violations" run takes the catch branch with err.stdout
    // populated. Treat that as a normal failed-check result, not an error.
    const output = imports.execFileSync(
      "node",
      ["harness/audit-ast-density.mjs", "--threshold", String(THRESHOLD)],
      {
        cwd: imports.ROOT,
        timeout: 120_000,
        stdio: "pipe",
        encoding: "utf-8",
        env: { ...process.env, FORCE_COLOR: "0" },
      },
    );
    return summarize(output);
  } catch (err) {
    const stdout = (err.stdout || "").toString();
    if (stdout.trim().length > 0) return summarize(stdout);
    const stderr = (err.stderr || "").toString().trim();
    return { pass: false, detail: `AST density audit error: ${stderr.slice(0, 500)}` };
  }
}
