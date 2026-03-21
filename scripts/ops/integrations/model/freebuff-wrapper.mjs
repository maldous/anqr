#!/usr/bin/env node

/**
 * freebuff-wrapper.mjs — Freebuff SDK wrapper for harness integration
 *
 * Uses @codebuff/sdk for programmatic AI agent execution in the harness.
 * Falls back to PTY (interactive CLI) when rate limited.
 *
 * Usage:
 *   node freebuff-wrapper.mjs --task "description of task" [--project /path/to/project]
 *   node freebuff-wrapper.mjs --issue-id ANQ-123 [--project /path/to/project]
 *
 * Environment:
 *   CODEBUFF_API_KEY - Required API key from codebuff.com/api-keys
 *
 * Exit codes:
 *   0 = Success
 *   1 = Failure (error, timeout, etc.)
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CodebuffClient } from "@codebuff/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports", "freebuff");

const TIMEOUT_MS = 5 * 60 * 1000; // 5 min default timeout

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { task: null, issueId: null, project: PROJECT_ROOT, timeout: TIMEOUT_MS };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--task" && args[i + 1]) opts.task = args[++i];
    else if (args[i] === "--issue-id" && args[i + 1]) opts.issueId = args[++i];
    else if (args[i] === "--project" && args[i + 1]) opts.project = args[++i];
    else if (args[i] === "--timeout" && args[i + 1]) opts.timeout = parseInt(args[++i], 10) || TIMEOUT_MS;
  }
  return opts;
}

function getApiKey() {
  // Check environment variable
  const envKey = process.env.CODEBUFF_API_KEY;
  if (envKey) return envKey;

  // Check .env file
  const envPath = path.join(PROJECT_ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/CODEBUFF_API_KEY=(?:"([^"]+)"|([^\s\n]+))/);
    if (match) return match[1] || match[2];
  }

  return null;
}

function checkSdkAvailable() {
  try {
    // Check if SDK is installed
    const pkgPath = path.join(PROJECT_ROOT, "node_modules", "@codebuff", "sdk", "package.json");
    if (!fs.existsSync(pkgPath)) {
      return { available: false, reason: "@codebuff/sdk not installed - run: npm install @codebuff/sdk" };
    }

    // Check for API key
    const apiKey = getApiKey();
    if (!apiKey) {
      return { available: false, reason: "CODEBUFF_API_KEY not set - get key from codebuff.com/api-keys" };
    }

    return { available: true };
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

// SDK-based execution
async function runWithSdk(opts) {
  const { task, project, timeout } = opts;
  const apiKey = getApiKey();

  const client = new CodebuffClient({
    apiKey,
    cwd: project,
  });

  const enhancedPrompt = buildEnhancedPrompt(task);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
  });

  try {
    const events = [];
    const result = await Promise.race([
      client.run({
        agent: "codebuff/base@latest",
        prompt: enhancedPrompt,
        handleEvent: (event) => {
          events.push(event);
        },
        maxAgentSteps: 50,
      }),
      timeoutPromise,
    ]);

    return {
      exitCode: 0,
      output: result.output || "",
      events: events.slice(-20),
      error: null,
      method: "sdk",
    };
  } catch (err) {
    const errStr = err.message || "";
    // Check for rate limit - need to fallback to PTY
    if (errStr.includes("rate_limit") || errStr.includes("429") || errStr.includes("session limit")) {
      return { shouldFallback: true, error: err.message };
    }

    return {
      exitCode: 1,
      output: "",
      events: [],
      error: err.message,
      method: "sdk",
    };
  }
}

// PTY-based execution (fallback when rate limited)
async function runWithPty(opts) {
  const { task, project, timeout } = opts;

  const prompt = buildEnhancedPrompt(task);
  const tmpDir = "/tmp";
  const inputFile = path.join(tmpDir, `freebuff-input-${Date.now()}.txt`);
  const outputFile = path.join(tmpDir, `freebuff-output-${Date.now()}.log`);

  fs.writeFileSync(inputFile, prompt + "\n");

  // Use script command to create pseudo-TTY for freebuff
  const scriptCmd = `script -q -c "freebuff --cwd ${project}" ${outputFile} < ${inputFile}`;

  return new Promise((resolve) => {
    const child = spawn("bash", ["-c", scriptCmd], {
      cwd: project,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      let stdout = "";
      try {
        if (fs.existsSync(outputFile)) {
          stdout = fs.readFileSync(outputFile, "utf-8");
        }
      } catch {
        // Ignore
      }

      try {
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      } catch {
        // Ignore
      }

      resolve({
        exitCode: code,
        stdout: stdout.slice(-10000),
        stderr: stderr.slice(-5000),
        method: "pty",
      });
    });

    child.on("error", (err) => {
      resolve({
        exitCode: 1,
        stdout: "",
        stderr: err.message,
        method: "pty",
      });
    });

    setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        exitCode: 124,
        stdout: "",
        stderr: `Timeout after ${timeout}ms`,
        method: "pty",
      });
    }, timeout);
  });
}

// Main execution with fallback
async function runWithCodebuff(opts) {
  // Try SDK first
  const sdkResult = await runWithSdk(opts);

  // If rate limited, fallback to PTY
  if (sdkResult.shouldFallback) {
    console.log("[freebuff] Rate limited by SDK - falling back to PTY approach...");
    const ptyResult = await runWithPty(opts);
    return {
      exitCode: ptyResult.exitCode,
      output: ptyResult.stdout || "",
      error: ptyResult.stderr,
      method: "pty",
    };
  }

  return sdkResult;
}

async function main() {
  const opts = parseArgs();

  if (!opts.task && !opts.issueId) {
    console.error("Usage: freebuff-wrapper.mjs --task 'description' [--project /path]");
    console.error("       freebuff-wrapper.mjs --issue-id ANQ-123 [--project /path]");
    console.error("");
    console.error("Required: CODEBUFF_API_KEY environment variable");
    process.exit(1);
  }

  // Validate project exists
  if (!fs.existsSync(opts.project)) {
    console.error(`[freebuff] ERROR: Project not found: ${opts.project}`);
    process.exit(1);
  }

  // Build task from issue if provided
  let task = opts.task;
  if (opts.issueId) {
    task = `Process Linear issue ${opts.issueId}. The issue description and instructions are in the project docs or Linear. Complete the implementation following the project's coding standards.`;
  }

  console.log(`[freebuff] Starting task (timeout: ${opts.timeout}ms)...`);
  console.log(`[freebuff] Project: ${opts.project}`);

  // Check availability and choose execution method
  const sdkCheck = checkSdkAvailable();
  let result;

  if (sdkCheck.available) {
    console.log(`[freebuff] SDK available, using Codebuff agent`);
    result = await runWithCodebuff({ ...opts, task });
  } else {
    // SDK not available - use PTY directly
    console.log(`[freebuff] SDK not available: ${sdkCheck.reason}`);
    console.log("[freebuff] Using PTY approach...");
    result = await runWithPty({ ...opts, task });
  }

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    task: task.slice(0, 500),
    project: opts.project,
    exitCode: result.exitCode,
    method: result.method || "unknown",
    outputLength: result.output?.length || 0,
    output: result.output?.slice(-5000),
    error: result.error,
  };

  ensureDir(REPORTS_DIR);
  const reportFile = path.join(REPORTS_DIR, `latest-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
  console.log(`[freebuff] Report written to: ${reportFile}`);

  if (result.exitCode === 0) {
    console.log("[freebuff] Completed successfully");
    const outputStr = typeof result.output === "string" ? result.output : JSON.stringify(result.output);
    console.log("[freebuff] Output:", outputStr.slice(0, 500) || "(no output)");
    process.exit(0);
  } else {
    console.log(`[freebuff] Failed: ${result.error}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`[freebuff] Fatal: ${err.message}`);
    process.exit(1);
  });
}

export { runWithCodebuff, checkSdkAvailable };