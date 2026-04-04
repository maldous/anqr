import { execFileSync } from "node:child_process";

import { runCommandWithHeartbeat } from "./run-command-with-heartbeat.mjs";
import { trimOutput } from "./trim-output.mjs";

export function runCommand(command, options = {}) {
  const { heartbeat, ...execOptions } = options;

  // If heartbeat is provided, use spawn with periodic heartbeats
  // Otherwise fall back to execFileSync for backwards compatibility
  if (heartbeat && typeof heartbeat === "function") {
    return runCommandWithHeartbeat(command, execOptions, heartbeat);
  }

  try {
    const output = execFileSync("/bin/sh", ["-c", command], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 2 * 1024 * 1024,
      ...execOptions,
    });
    return { ok: true, output: trimOutput(output) };
  } catch (err) {
    const stdout = (err.stdout || "").toString();
    const stderr = (err.stderr || "").toString();
    return { ok: false, output: trimOutput(`${stdout}\n${stderr}`) };
  }
}
