import { execFileSync } from "node:child_process";

import { ROOT } from "./root.mjs";

export function checkNpmScript(scriptName, label, timeout_ms = 120_000) {
  try {
    execFileSync("npm", ["run", scriptName], {
      cwd: ROOT,
      stdio: "pipe",
      timeout: timeout_ms,
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    return { pass: true, detail: `${label} passed` };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : "";
    const stdout = err.stdout ? err.stdout.toString().trim() : "";
    const output = stderr || stdout;
    const lines = output.split("\n");
    const summary =
      lines.length > 5
        ? lines.slice(0, 3).join("\n") + "\n... (" + (lines.length - 3) + " more lines)"
        : output;
    const fallback = `exit code ${err.status}`;
    return { pass: false, detail: `${label} failed: ${summary || fallback}` };
  }
}
