import { spawn } from "node:child_process";

import { trimOutput } from "./trim-output.mjs";

export function runCommandWithHeartbeat(command, execOptions, heartbeat) {
  const HEARTBEAT_INTERVAL_MS = 60_000; // Send heartbeat every 60 seconds
  const startMs = Date.now();

  return new Promise((resolve) => {
    // Send initial heartbeat
    let initialHb;
    try {
      initialHb = heartbeat();
    } catch (err) {
      resolve({
        ok: false,
        output: `Heartbeat threw before command execution: ${err.message}`,
        heartbeatFailed: true,
        heartbeatDetail: { phase: "initial", reason: err.message, elapsedMs: 0 },
      });
      return;
    }
    if (!initialHb || !initialHb.ok) {
      const reason = initialHb?.reason || "unknown";
      resolve({
        ok: false,
        output: `Heartbeat failed before command execution: ${reason}`,
        heartbeatFailed: true,
        heartbeatDetail: { phase: "initial", reason, elapsedMs: 0 },
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
    let heartbeatDetail = null;

    // Set up periodic heartbeat
    const heartbeatTimer = setInterval(() => {
      let hbResult;
      try {
        hbResult = heartbeat();
      } catch (err) {
        heartbeatFailed = true;
        heartbeatDetail = {
          phase: "periodic",
          reason: err.message,
          elapsedMs: Date.now() - startMs,
        };
        clearInterval(heartbeatTimer);
        try {
          child.kill("SIGTERM");
        } catch {}
        return;
      }
      if (!hbResult || !hbResult.ok) {
        heartbeatFailed = true;
        heartbeatDetail = {
          phase: "periodic",
          reason: hbResult?.reason || "unknown",
          elapsedMs: Date.now() - startMs,
        };
        clearInterval(heartbeatTimer);
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

      // Send final heartbeat (best-effort)
      if (!heartbeatFailed) {
        try {
          const finalHb = heartbeat();
          if (!finalHb || !finalHb.ok) {
            heartbeatFailed = true;
            heartbeatDetail = {
              phase: "final",
              reason: finalHb?.reason || "unknown",
              elapsedMs: Date.now() - startMs,
            };
          }
        } catch (err) {
          heartbeatFailed = true;
          heartbeatDetail = {
            phase: "final",
            reason: err.message,
            elapsedMs: Date.now() - startMs,
          };
        }
      }

      if (heartbeatFailed) {
        resolve({
          ok: false,
          output: `Heartbeat failed during command execution: ${heartbeatDetail?.reason || "unknown"}`,
          heartbeatFailed: true,
          heartbeatDetail,
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
