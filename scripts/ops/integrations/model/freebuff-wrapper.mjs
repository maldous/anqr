#!/usr/bin/env node

/**
 * freebuff-wrapper.mjs — Freebuff CLI wrapper for harness integration
 *
 * Invokes freebuff CLI as an external code execution agent for the harness.
 * Freebuff is an interactive AI coding agent that runs in the terminal.
 *
 * IMPORTANT: Freebuff requires interactive TTY input. This wrapper attempts to
 * provide tasks via stdin, but for reliable operation, use the knowledge.md
 * approach: write task to {project}/knowledge.md and run freebuff separately.
 *
 * Usage:
 *   node freebuff-wrapper.mjs --task "description of task" [--project /path/to/project]
 *   node freebuff-wrapper.mjs --issue-id ANQ-123 [--project /path/to/project]
 *   node freebuff-wrapper.mjs --knowledge-mode [--project /path/to/project]
 *
 * Exit codes:
 *   0 = Success
 *   1 = Failure (freebuff error, timeout, etc.)
 *   124 = Timeout
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../../../");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports", "freebuff");

const TIMEOUT_MS = 5 * 60 * 1000; // 5 min default timeout
// Note: freebuff uses internal model selection (MiniMax M2.5 for coding, Gemini for research)

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

function checkFreebuffAvailable() {
  const which = spawnSync("which", ["freebuff"], { encoding: "utf-8" });
  if (which.status !== 0) {
    return { available: false, reason: "freebuff not found in PATH" };
  }
  const output = which.stdout.trim();
  return { available: true, path: output };
}

async function runFreebuff(opts) {
  const { task, project, timeout } = opts;

  // Freebuff runs interactively, so we need to provide input via stdin
  // The task description goes into a temp file that freebuff can read
  const prompt = [
    `Project: ${project}`,
    "",
    "Task:",
    task,
    "",
    "IMPORTANT: After completing the task, run these validations:",
    "1. Run 'npm run typecheck' - fix any type errors",
    "2. Run 'npm run lint' - fix any lint errors",
    "3. Run 'npm run test' - ensure tests pass",
    "",
    "When done, summarize what you changed.",
  ].join("\n");

  return new Promise((resolve) => {
    // Note: freebuff doesn't support --model flag. It uses its built-in models.
    const child = spawn("freebuff", ["--cwd", project], {
      cwd: project,
      stdio: ["pipe", "pipe", "pipe"],
      timeout,
    });

    let stdout = "";
    let stderr = "";
    let inputSent = false;

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      // Detect when freebuff is waiting for input and send our task
      if ((!inputSent && stdout.includes(">")) || stdout.includes("What would you like")) {
        child.stdin.write(prompt + "\n");
        inputSent = true;
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code,
        stdout: stdout.slice(-10000), // last 10k chars
        stderr: stderr.slice(-5000),
      });
    });

    child.on("error", (err) => {
      resolve({
        exitCode: 1,
        stdout: "",
        stderr: err.message,
      });
    });

    // Timeout handler
    setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        exitCode: 124,
        stdout: stdout.slice(-10000),
        stderr: `Timeout after ${timeout}ms`,
      });
    }, timeout);
  });
}

async function main() {
  const opts = parseArgs();

  if (!opts.task && !opts.issueId) {
    console.error("Usage: freebuff-wrapper.mjs --task 'description' [--project /path] [--model minimax]");
    console.error("       freebuff-wrapper.mjs --issue-id ANQ-123 [--project /path]");
    process.exit(1);
  }

  // Check availability
  const freebuffCheck = checkFreebuffAvailable();
  if (!freebuffCheck.available) {
    console.error(`[freebuff] ERROR: ${freebuffCheck.reason}`);
    process.exit(1);
  }
  console.log(`[freebuff] Found at: ${freebuffCheck.path}`);

  // Build task from issue if provided
  let task = opts.task;
  if (opts.issueId) {
    task = `Process Linear issue ${opts.issueId}. The issue description and instructions are in the project docs or Linear. Complete the implementation following the project's coding standards.`;
  }

  console.log(`[freebuff] Starting task (timeout: ${opts.timeout}ms)...`);
  console.log(`[freebuff] Project: ${opts.project}`);

  const result = await runFreebuff({ ...opts, task });

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    task: task.slice(0, 500),
    project: opts.project,
    exitCode: result.exitCode,
    stdoutLength: result.stdout.length,
    stderrLength: result.stderr.length,
    stdout: result.stdout.slice(-5000),
    stderr: result.stderr.slice(-2000),
  };

  ensureDir(REPORTS_DIR);
  const reportFile = path.join(REPORTS_DIR, `latest-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
  console.log(`[freebuff] Report written to: ${reportFile}`);

  if (result.exitCode === 0) {
    console.log("[freebuff] Completed successfully");
    process.exit(0);
  } else if (result.exitCode === 124) {
    console.log("[freebuff] Timed out");
    process.exit(124);
  } else {
    console.log(`[freebuff] Failed with exit code: ${result.exitCode}`);
    console.log(`[freebuff] stderr: ${result.stderr.slice(0, 500)}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`[freebuff] Fatal: ${err.message}`);
    process.exit(1);
  });
}

export { runFreebuff, checkFreebuffAvailable };