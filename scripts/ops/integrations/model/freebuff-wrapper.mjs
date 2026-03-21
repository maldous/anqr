#!/usr/bin/env node

/**
 * freebuff-wrapper.mjs — Freebuff SDK wrapper for harness integration
 *
 * Uses @codebuff/sdk for programmatic AI agent execution in the harness.
 * Provides a clean API for running Codebuff agents on coding tasks.
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

async function runWithCodebuff(opts) {
  const { task, project, timeout } = opts;
  const apiKey = getApiKey();

  const client = new CodebuffClient({
    apiKey,
    cwd: project,
  });

  // Build enhanced prompt with validation instructions
  const enhancedPrompt = [
    task,
    "",
    "IMPORTANT: After completing the task, run these validations:",
    "1. Run 'npm run typecheck' - fix any type errors",
    "2. Run 'npm run lint' - fix any lint errors", 
    "3. Run 'npm run test' - ensure tests pass",
    "",
    "When done, summarize what you changed.",
  ].join("\n");

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
  });

  let events = [];
  try {
    // Run the agent with event handling
    events = [];
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
      events: events.slice(-20), // Last 20 events
      error: null,
    };
  } catch (err) {
    return {
      exitCode: 1,
      output: "",
      events: events.slice(-20),
      error: err.message,
    };
  }
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

  // Check availability
  const sdkCheck = checkSdkAvailable();
  if (!sdkCheck.available) {
    console.error(`[freebuff] ERROR: ${sdkCheck.reason}`);
    process.exit(1);
  }
  console.log(`[freebuff] SDK available, using Codebuff agent`);

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

  const result = await runWithCodebuff({ ...opts, task });

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    task: task.slice(0, 500),
    project: opts.project,
    exitCode: result.exitCode,
    outputLength: result.output?.length || 0,
    output: result.output?.slice(-5000),
    error: result.error,
    eventCount: result.events?.length || 0,
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