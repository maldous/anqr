import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

import { ensureEvidenceRecord } from "../../../core/task-evidence.mjs";
import { EXIT_LOCK_CONTENTION } from "../../../core/symphony-runner-exit-codes.mjs";
import { releaseLease } from "../../../symphony-state.mjs";
import { readRunnerOutcome } from "./read-runner-outcome.mjs";
import { sendJson } from "./send-json.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

const execFileAsync = promisify(execFile);
const RUNNER_ENTRY = "harness/ops/orchestration/symphony-runner/runtime.mjs";
const RUNNER_TIMEOUT_MS = 30 * 60 * 1000;

export async function executeLinearIssueRequest(req, res) {
  let body;
  try {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf-8");
          resolve(raw ? JSON.parse(raw) : {});
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });
  } catch (err) {
    return sendJson(res, 400, {
      error: { message: `Invalid JSON body: ${err.message}`, type: "invalid_request_error" },
    });
  }

  const identifier = String(body?.identifier || req.headers["x-linear-identifier"] || "").trim();
  const correlationId = req.headers["x-anqr-correlation-id"] || randomUUID();
  if (!identifier) {
    return sendJson(res, 400, {
      error: { message: "Missing Linear issue identifier", type: "invalid_request_error" },
    });
  }

  if (!process.env.LINEAR_API_KEY) {
    return sendJson(res, 500, {
      error: { message: `LINEAR_API_KEY is not set for identifier ${identifier}`, type: "server_error" },
    });
  }

  try {
    logInfo(`[linear-execute] Starting execution for ${identifier} (correlation=${correlationId})`);

    try {
      ensureEvidenceRecord(correlationId, {
        source: "direct-execute",
        issueIdentifier: identifier,
      });
    } catch {
      /* best-effort — evidence dir may not exist in all environments */
    }

    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [RUNNER_ENTRY, "--issue", identifier],
      {
        cwd: process.cwd(),
        env: { ...process.env, ANQR_CORRELATION_ID: correlationId },
        timeout: RUNNER_TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    if (stdout.trim()) {
      logInfo(`[linear-execute] runner stdout for ${identifier}\n${stdout.trim()}`);
    }
    if (stderr.trim()) {
      logWarn(`[linear-execute] runner stderr for ${identifier}\n${stderr.trim()}`);
    }

    logInfo(`[linear-execute] Completed ${identifier}`);

    // Read structured runner outcome — this is the single source of truth
    // for whether a commit was actually created. Previously the HTTP layer
    // returned 202 "execution_complete" regardless, conflating "runner
    // finished" with "commit exists".
    const outcome = readRunnerOutcome(correlationId);
    if (outcome) {
      logInfo(
        `[linear-execute] Runner outcome for ${identifier}: result=${outcome.result}` +
        (outcome.branch ? ` branch=${outcome.branch}` : "") +
        (outcome.headSha ? ` sha=${outcome.headSha.slice(0, 8)}` : "") +
        (outcome.reason ? ` reason=${outcome.reason}` : ""),
      );
      return sendJson(res, 202, {
        status: outcome.result,
        identifier,
        correlationId,
        outcome,
      });
    }

    // No outcome file (legacy path) — still return 202 for backward compat
    return sendJson(res, 202, {
      status: "execution_complete",
      identifier,
      correlationId,
    });
  } catch (err) {
    const stderr = typeof err?.stderr === "string" ? err.stderr.trim() : "";
    const stdout = typeof err?.stdout === "string" ? err.stdout.trim() : "";
    if (stdout) {
      logInfo(`[linear-execute] runner stdout for ${identifier}\n${stdout}`);
    }
    if (stderr) {
      logWarn(`[linear-execute] runner stderr for ${identifier}\n${stderr}`);
    }

    // Exit code EXIT_LOCK_CONTENTION = lock contention (another runner active on this worktree)
    // This is NOT a failure of the issue itself — return 503 so the scheduler
    // knows to retry later rather than marking the issue as processed.
    // execFileAsync sets err.code to the numeric exit code for non-zero exits.
    if (err?.code === EXIT_LOCK_CONTENTION) {
      logWarn(`[linear-execute] Runner for ${identifier} exited with lock contention (exit=2) — returning 503`);
      return sendJson(res, 503, {
        status: "worktree_busy",
        identifier,
        correlationId,
        error: { message: "Worktree lock contention — another runner is active", type: "worktree_busy" },
      });
    }

    const message =
      err?.code === "ETIMEDOUT"
        ? `Timed out executing ${identifier}`
        : err?.message || `Failed executing ${identifier}`;
    logError(`[linear-execute] Failed for ${identifier}: ${message}`);

    // Release the scheduler lease so the issue can be re-dispatched immediately.
    // The router is fire-and-forget — the scheduler already returned 202 and
    // kept the lease active. Without this release, the stale lease blocks
    // re-dispatch for the full 20-minute TTL, causing "rejected: already_claimed"
    // on every scheduler cycle until the lease expires.
    try {
      const released = releaseLease(identifier);
      if (released?.ok) {
        logInfo(`[linear-execute] Released stale lease for ${identifier} after runner crash`);
      }
    } catch (releaseErr) {
      logWarn(`[linear-execute] Could not release lease for ${identifier}: ${releaseErr.message}`);
    }

    return sendJson(res, 500, {
      error: { message, type: "server_error" },
    });
  }
}
