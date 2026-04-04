import { spawn } from "node:child_process";

import { trimOutput } from "./trim-output.mjs";

export function runCommandWithHeartbeat(command, execOptions, heartbeat) {
  const HEARTBEAT_INTERVAL_MS = 60_000; // Send heartbeat every 60 seconds

  return new Promise((resolve) => {
    // Send initial heartbeat
    const initialHb = heartbeat();
    if (!initialHb || !initialHb.ok) {
      resolve({
        ok: false,
        output: "Heartbeat failed before command execution",
        heartbeatFailed: true,
      });
      return;
    }

    const child = spawn("/bin/sh", ["-c", command], {
      cwd: execOptions.cwd,
      env: execOptions.env || process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let heartbeatFailed = false;

    // Set up periodic heartbeat
    const heartbeatTimer = setInterval(() => {
      const hbResult = heartbeat();
      if (!hbResult || !hbResult.ok) {
        heartbeatFailed = true;
        clearInterval(heartbeatTimer);
        // Kill the child process if heartbeat fails
        try {
          child.kill("SIGTERM");
        } catch {}
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Set up timeout if specified
    let timeoutTimer = null;
    if (execOptions.timeout) {
      timeoutTimer = setTimeout(() => {
        clearInterval(heartbeatTimer);
        try {
          child.kill("SIGTERM");
        } catch {}
      }, execOptions.timeout);
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      clearInterval(heartbeatTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      // Send final heartbeat
      if (!heartbeatFailed) {
        heartbeat();
      }

      if (heartbeatFailed) {
        resolve({
          ok: false,
          output: "Heartbeat failed during command execution",
          heartbeatFailed: true,
        });
      } else if (code === 0) {
        resolve({ ok: true, output: trimOutput(stdout) });
      } else {
        resolve({ ok: false, output: trimOutput(`${stdout}\n${stderr}`) });
      }
    });

    child.on("error", (err) => {
      clearInterval(heartbeatTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      resolve({ ok: false, output: trimOutput(err.message) });
    });
  });
}
