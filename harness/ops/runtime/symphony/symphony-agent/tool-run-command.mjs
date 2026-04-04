import { execFileSync } from "node:child_process";

import { ALLOWED_COMMANDS } from "./allowed-commands.mjs";

export function toolRunCommand(projectRoot, args) {
  const cmd = (args.command || "").trim();
  if (/[|;&><$`]/.test(cmd)) {
    return "Error: Pipes, redirects, chaining, and variable expansion are not allowed.";
  }
  const parts = cmd.split(/\s+/);
  if (!ALLOWED_COMMANDS.has(parts[0])) {
    return `Error: Command "${parts[0]}" is not in the allowlist. Allowed: ${[...ALLOWED_COMMANDS].join(", ")}`;
  }
  try {
    const output = execFileSync(parts[0], parts.slice(1), {
      cwd: projectRoot,
      timeout: 15_000,
      maxBuffer: 512 * 1024,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const trimmed = output.length > 8000 ? output.slice(0, 8000) + "\n... (truncated)" : output;
    return trimmed || "(no output)";
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr).slice(0, 2000) : "";
    const stdout = err.stdout ? String(err.stdout).slice(0, 2000) : "";
    return `Command exited with code ${err.status || 1}:\n${stdout}\n${stderr}`.trim();
  }
}
