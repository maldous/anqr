#!/usr/bin/env node

/**
 * codebuff-sdk-runner.mjs — Codebuff SDK wrapper for harness integration
 *
 * Uses @codebuff/sdk for AI agent execution in the harness.
 * Supports multiple API keys from DIFFERENT accounts for rate-limit rotation.
 *
 * Execution order:
 *   1. CODEBUFF_API_KEY  → paid mode (uses subscription credits)
 *   2. CODEBUFF_API_KEY  → free mode (no credits charged)
 *   3. CODEBUFF_API_KEY2 → free mode (second account fallback)
 *   4. CODEBUFF_API_KEY3 → free mode (additional accounts, etc.)
 *
 * Usage:
 *   node codebuff-sdk-runner.mjs --task "description of task" [--project /path/to/project]
 *   node codebuff-sdk-runner.mjs --issue-id ANQ-123 [--project /path/to_project]
 *
 * Environment:
 *   CODEBUFF_API_KEY  - Primary API key, paid account (required)
 *   CODEBUFF_API_KEY2 - Secondary API key from a DIFFERENT account (optional)
 *   CODEBUFF_API_KEY3 - Additional keys follow the same pattern (optional)
 *
 * Exit codes:
 *   0 = Success
 *   1 = Failure (error, timeout, etc.)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CodebuffClient, WEBSITE_URL } from "@codebuff/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports", "codebuff");

const TIMEOUT_MS = 5 * 60 * 1000; // 5 min default timeout
const INTER_KEY_DELAY_MS = 3_000; // delay between key rotation attempts

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { task: null, issueId: null, project: PROJECT_ROOT, timeout: TIMEOUT_MS };
  const argCount = args.length;
  let idx = 0;
  while (idx < argCount) {
    const current = args[idx];
    if (current === "--task" && idx + 1 < argCount) {
      opts.task = args[idx + 1];
      idx += 2;
    } else if (current === "--issue-id" && idx + 1 < argCount) {
      opts.issueId = args[idx + 1];
      idx += 2;
    } else if (current === "--project" && idx + 1 < argCount) {
      opts.project = args[idx + 1];
      idx += 2;
    } else if (current === "--timeout" && idx + 1 < argCount) {
      opts.timeout = Number.parseInt(args[idx + 1], 10) || TIMEOUT_MS;
      idx += 2;
    } else {
      idx += 1;
    }
  }
  return opts;
}

function getAllApiKeys() {
  const keys = [];

  // Check environment variables (CODEBUFF_API_KEY, CODEBUFF_API_KEY2, etc.)
  for (const key of Object.keys(process.env).sort()) {
    if (key.startsWith("CODEBUFF_API_KEY") && !key.endsWith("_FILE")) {
      const value = process.env[key];
      if (value) keys.push(value);
    }
  }

  // Check .env file
  const envPath = path.join(PROJECT_ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const regex = /CODEBUFF_API_KEY\d*=(?:"([^"]+)"|([^\s]+))/g;
    let match;
    while ((match = regex.exec(envContent)) !== null) {
      const key = match[1] || match[2];
      if (key && !keys.includes(key)) {
        keys.push(key);
      }
    }
  }

  return keys;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveKeyAccount(apiKey) {
  try {
    const url = new URL("/api/v1/me?fields=id,email", WEBSITE_URL);
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, email: data.email };
  } catch {
    return null;
  }
}

async function validateApiKeys(apiKeys) {
  const results = await Promise.allSettled(apiKeys.map((k) => resolveKeyAccount(k)));
  const accounts = [];
  for (let i = 0; i < apiKeys.length; i++) {
    const result = results[i];
    const info = result.status === "fulfilled" ? result.value : null;
    const masked = apiKeys[i].slice(0, 6) + "..." + apiKeys[i].slice(-4);
    if (info) {
      accounts.push({ index: i, ...info });
      console.log(`[codebuff] Key ${i + 1} (${masked}): ${info.email}`);
    } else {
      console.warn(`[codebuff] Key ${i + 1} (${masked}): could not resolve account (auth error?)`);
    }
  }

  const uniqueIds = new Set(accounts.map((a) => a.id));
  if (accounts.length > 1 && uniqueIds.size < accounts.length) {
    console.warn("[codebuff] WARNING: Multiple keys resolve to the SAME account.");
    console.warn("[codebuff] Rate-limit rotation will NOT help — limits are per-account.");
    console.warn("[codebuff] Use keys from different Codebuff accounts for effective rotation.");
  } else if (uniqueIds.size > 1) {
    console.log(`[codebuff] ${uniqueIds.size} distinct accounts confirmed — rotation enabled.`);
  }

  return accounts;
}

function checkSdkAvailable() {
  try {
    // Check if SDK is installed
    const pkgPath = path.join(PROJECT_ROOT, "node_modules", "@codebuff", "sdk", "package.json");
    if (!fs.existsSync(pkgPath)) {
      return {
        available: false,
        reason: "@codebuff/sdk not installed - run: npm install @codebuff/sdk",
      };
    }

    // Check for API keys
    const keys = getAllApiKeys();
    if (keys.length === 0) {
      return {
        available: false,
        reason: "No CODEBUFF_API_KEY* found - get keys from codebuff.com/api-keys",
      };
    }

    return { available: true, apiKeys: keys };
  } catch (err) {
    return { available: false, reason: err.message };
  }
}

function buildEnhancedPrompt(task) {
  return [
    task,
    "",
    "IMPORTANT: After completing the task, run these validations:",
    "1. Run 'npm run typecheck' - fix any type errors",
    "2. Run 'npm run lint' - fix any lint errors",
    "3. Run 'npm run test' - ensure tests pass",
    "",
    "When done, summarize what you changed.",
  ].join("\n");
}

function isRateLimitError(errStr) {
  const s = errStr.toLowerCase();
  return (
    s.includes("429") ||
    s.includes("rate_limit") ||
    s.includes("too many requests") ||
    s.includes("session limit") ||
    s.includes("rate_limit_exceeded") ||
    s.includes("weekly limit") ||
    s.includes("limit resets") ||
    s.includes("continue with credits") ||
    s.includes("subscription")
  );
}

function isAuthError(errStr) {
  return (
    errStr.includes("401") ||
    errStr.includes("403") ||
    errStr.includes("Unauthorized") ||
    errStr.includes("Forbidden") ||
    errStr.includes("Authentication failed")
  );
}

function isRetryableError(err) {
  const errStr = (err.message || "").toLowerCase();
  return (
    isRateLimitError(errStr) ||
    errStr.includes("retryerror") ||
    errStr.includes("timeout") ||
    errStr.includes("etimedout")
  );
}

function buildAttemptPlan(apiKeys, accounts) {
  const attempts = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const acct = accounts.find((a) => a.index === i);
    const email = acct ? acct.email : `key ${i + 1}`;
    const apiKey = apiKeys[i];

    // First key: try paid mode first, then free mode
    if (i === 0) {
      attempts.push({ apiKey, costMode: undefined, label: `${email} (paid)` });
    } else {
      // Additional keys: free mode only
      attempts.push({ apiKey, costMode: "free", label: `${email} (free)` });
    }
    // Always add free mode attempt for first key
    if (i === 0) {
      attempts.push({ apiKey, costMode: "free", label: `${email} (free)` });
    }
  }

  return attempts;
}

// SDK-based execution — tries paid first, then free mode across all keys
async function runWithSdk(opts) {
  const { task, project, timeout } = opts;
  const apiKeys = getAllApiKeys();

  if (apiKeys.length === 0) {
    return {
      exitCode: 1,
      output: "",
      events: [],
      error: "No CODEBUFF_API_KEY* found",
      method: "sdk",
    };
  }

  // Pre-flight: validate keys belong to different accounts
  const accounts = await validateApiKeys(apiKeys);

  // Build ordered attempt plan: paid first, then free across all keys
  const attempts = buildAttemptPlan(apiKeys, accounts);
  console.log(
    `[codebuff] Attempt plan (${attempts.length} attempts): ${attempts.map((a) => a.label).join(" → ")}`,
  );

  const enhancedPrompt = buildEnhancedPrompt(task);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
  });

  let lastError = null;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    console.log(`[codebuff] Attempt ${i + 1}/${attempts.length}: ${attempt.label}...`);

    // Special greeting for third account
    if (apiKeys.length >= 3 && attempt.apiKey === apiKeys[2]) {
      console.log(`[codebuff] 👋 Hello from third account!`);
    }

    if (i > 0) {
      console.log(`[codebuff] Waiting ${INTER_KEY_DELAY_MS / 1000}s before next attempt...`);
      await sleep(INTER_KEY_DELAY_MS);
    }

    const client = new CodebuffClient({
      apiKey: attempt.apiKey,
      cwd: project,
    });

    try {
      const events = [];
      const runOpts = {
        agent: "codebuff/base@latest",
        prompt: enhancedPrompt,
        handleEvent: (event) => {
          events.push(event);
        },
        maxAgentSteps: 50,
      };
      if (attempt.costMode) {
        runOpts.costMode = attempt.costMode;
      }

      const result = await Promise.race([client.run(runOpts), timeoutPromise]);

      const output = result.output;
      // output is typically a string with the agent's response
      const resultStr = typeof output === "string" ? output : JSON.stringify(output);

      // Only treat as failure if it's actually a rate limit or auth error
      // Don't fail on "error" strings that appear in normal output
      if (isRateLimitError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.log(`[codebuff] Rate limited on ${attempt.label}, trying next...`);
        continue;
      }
      if (isAuthError(resultStr)) {
        lastError = resultStr.slice(0, 500);
        console.warn(`[codebuff] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

      // Success - even if output contains "error" word in normal text
      return {
        exitCode: 0,
        output: resultStr,
        events: events.slice(-20),
        error: null,
        method: "sdk",
        account: attempt.label,
      };
    } catch (err) {
      const errStr = err.message || "";

      if (isAuthError(errStr)) {
        lastError = errStr;
        console.warn(`[codebuff] Auth error on ${attempt.label}, skipping.`);
        continue;
      }

      if (isRetryableError(err)) {
        lastError = errStr;
        console.log(`[codebuff] ${errStr} on ${attempt.label}, trying next...`);
        continue;
      }

      return {
        exitCode: 1,
        output: "",
        events: [],
        error: errStr,
        method: "sdk",
        account: attempt.label,
      };
    }
  }

  return {
    exitCode: 1,
    output: "",
    events: [],
    error: `All ${attempts.length} attempts failed: ${lastError}`,
    method: "sdk",
  };
}

async function main() {
  const opts = parseArgs();

  if (!opts.task && !opts.issueId) {
    console.error("Usage: codebuff-sdk-runner.mjs --task 'description' [--project /path]");
    console.error("       codebuff-sdk-runner.mjs --issue-id ANQ-123 [--project /path]");
    console.error("");
    console.error("Required: CODEBUFF_API_KEY environment variable (paid account)");
    console.error("Optional: CODEBUFF_API_KEY2 from a DIFFERENT account for free-mode fallback");
    console.error("Get your API key from: codebuff.com/api-keys");
    console.error("");
    console.error(
      "Execution order: CODEBUFF_API_KEY paid → CODEBUFF_API_KEY free → CODEBUFF_API_KEY2 free",
    );
    process.exit(1);
  }

  // Validate project exists
  if (!fs.existsSync(opts.project)) {
    console.error(`[codebuff] ERROR: Project not found: ${opts.project}`);
    process.exit(1);
  }

  // Build task from issue if provided
  let task = opts.task;
  if (opts.issueId) {
    task = `Process Linear issue ${opts.issueId}. The issue description and instructions are in the project docs or Linear. Complete the implementation following the project's coding standards.`;
  }

  console.log(`[codebuff] Starting task (timeout: ${opts.timeout}ms)...`);
  console.log(`[codebuff] Project: ${opts.project}`);

  // Check SDK availability
  const sdkCheck = checkSdkAvailable();
  if (!sdkCheck.available) {
    console.error(`[codebuff] SDK not available: ${sdkCheck.reason}`);
    process.exit(1);
  }

  console.log(`[codebuff] Using Codebuff SDK (${sdkCheck.apiKeys.length} key(s) available)`);
  const result = await runWithSdk({ ...opts, task });

  // Write report
  let outputStr = "";
  if (result.output) {
    if (typeof result.output === "string") {
      outputStr = result.output;
    } else if (typeof result.output === "object") {
      outputStr = JSON.stringify(result.output, null, 2);
    } else {
      outputStr = String(result.output);
    }
  }
  const report = {
    timestamp: new Date().toISOString(),
    task: task.slice(0, 500),
    project: opts.project,
    exitCode: result.exitCode,
    method: result.method || "unknown",
    account: result.account || "unknown",
    outputLength: outputStr.length,
    output: outputStr.slice(-5000),
    error: result.error,
  };

  ensureDir(REPORTS_DIR);
  const reportFile = path.join(REPORTS_DIR, `latest-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
  console.log(`[codebuff] Report written to: ${reportFile}`);

  if (result.exitCode === 0) {
    console.log(`[codebuff] ✅ Success on attempt: ${result.account}`);
    console.log("[codebuff] Output:", outputStr.slice(0, 500) || "(no output)");
    process.exit(0);
  } else {
    console.log(`[codebuff] Failed: ${result.error}`);
    process.exit(1);
  }
}

// Run main if executed directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await main().catch((err) => {
    console.error(`[codebuff] Fatal: ${err.message}`);
    process.exit(1);
  });
}

export {
  runWithSdk,
  checkSdkAvailable,
  validateApiKeys,
  getAllApiKeys,
  buildAttemptPlan,
  REPORTS_DIR,
  PROJECT_ROOT,
};
