import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { sendJson } from "./send-json.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

const execFileAsync = promisify(execFile);
const RUNNER_ENTRY = "harness/ops/orchestration/symphony-runner/main.mjs";
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
  if (!identifier) {
    return sendJson(res, 400, {
      error: { message: "Missing Linear issue identifier", type: "invalid_request_error" },
    });
  }

  if (!process.env.LINEAR_API_KEY) {
    return sendJson(res, 500, {
      error: { message: "LINEAR_API_KEY is not set", type: "server_error" },
    });
  }

  try {
    logInfo(`[linear-execute] Starting execution for ${identifier}`);
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [RUNNER_ENTRY, "--issue", identifier],
      {
        cwd: process.cwd(),
        env: process.env,
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
    return sendJson(res, 202, {
      status: "completed",
      identifier,
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

    const message =
      err?.code === "ETIMEDOUT"
        ? `Timed out executing ${identifier}`
        : err?.message || `Failed executing ${identifier}`;
    logError(`[linear-execute] Failed for ${identifier}: ${message}`);
    return sendJson(res, 500, {
      error: { message, type: "server_error" },
    });
  }
}
