#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";

export const VALIDATION_MANIFEST = {
  typecheck: {
    command: "npx tsc --noEmit",
    timeoutMs: 120_000,
    fullProject: true,
  },
  lint: {
    command: "npx oxlint -c oxlint.json src/ packages/ apps/ scripts/",
    timeoutMs: 60_000,
    fullProject: true,
  },
  cspell: {
    command: "npx cspell --no-progress --no-must-find-files",
    timeoutMs: 60_000,
    changedOnly: true,
    fullProjectGlobs: ['"src/**/*.{ts,tsx}"', '"scripts/**/*.{mjs,js}"', '"docs/**/*.md"'],
    extensions: /\.(ts|tsx|js|mjs|md|json)$/,
  },
  astDensity: {
    command: "node scripts/audit-ast-density.mjs --threshold 1",
    timeoutMs: 120_000,
    changedOnly: true,
    fullProject: true,
    extensions: /\.(ts|tsx)$/,
  },
  tests: {
    command:
      "NODE_OPTIONS='--no-experimental-webstorage' npx vitest run --maxWorkers=100% --exclude 'tests/unit/gallery-scan-matrix.spec.ts' --exclude 'tests/unit/overlay-preservation-mode-audit.spec.ts' --exclude 'tests/unit/qr-generator-perf-profile.spec.ts'",
    timeoutMs: 120_000,
    fullProject: true,
  },
};

export function validationManifestHash() {
  return crypto.createHash("sha256").update(JSON.stringify(VALIDATION_MANIFEST)).digest("hex");
}

function trimOutput(text, max = 6000) {
  const value = String(text || "").trim();
  return value.length > max ? `${value.slice(0, max)}\n... (truncated)` : value;
}

function runCommand(command, options = {}) {
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

function runCommandWithHeartbeat(command, execOptions, heartbeat) {
  const HEARTBEAT_INTERVAL_MS = 60_000; // Send heartbeat every 60 seconds
  
  return new Promise((resolve) => {
    // Send initial heartbeat
    const initialHb = heartbeat();
    if (!initialHb || !initialHb.ok) {
      resolve({ ok: false, output: "Heartbeat failed before command execution", heartbeatFailed: true });
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
        resolve({ ok: false, output: "Heartbeat failed during command execution", heartbeatFailed: true });
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

export async function runTypecheck(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.typecheck.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.typecheck.timeoutMs,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed) return { pass: false, detail: "Heartbeat failed during typecheck", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}

export async function runLint(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.lint.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.lint.timeoutMs,
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed) return { pass: false, detail: "Heartbeat failed during lint", heartbeatFailed: true };
  if (!result.ok) return { pass: false, detail: result.output };
  const warningMatch = result.output.match(/Found (\d+) warning/);
  const warnings = warningMatch ? Number(warningMatch[1]) : 0;
  return warnings > 0
    ? { pass: false, detail: result.output || "Lint warnings found." }
    : { pass: true, detail: "" };
}

export function filterChangedFiles(changedFiles, regex) {
  return (changedFiles || []).filter((file) => regex.test(file));
}

export async function runCspell(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.cspell.extensions);
  const targets = opts.fullProject
    ? VALIDATION_MANIFEST.cspell.fullProjectGlobs
    : eligible.map((file) => JSON.stringify(file));
  if (targets.length === 0) return { pass: true, detail: "" };
  const result = await runCommand(`${VALIDATION_MANIFEST.cspell.command} ${targets.join(" ")}`, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.cspell.timeoutMs,
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed) return { pass: false, detail: "Heartbeat failed during cspell", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}

export async function runAstDensity(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.astDensity.extensions);
  const quoted = opts.fullProject ? "" : eligible.map((file) => JSON.stringify(file)).join(" ");
  if (!opts.fullProject && eligible.length === 0) return { pass: true, detail: "" };
  const result = await runCommand(
    [VALIDATION_MANIFEST.astDensity.command, quoted].filter(Boolean).join(" "),
    {
      cwd: projectRoot,
      timeout: VALIDATION_MANIFEST.astDensity.timeoutMs,
      heartbeat: opts.heartbeat,
    },
  );
  if (result.heartbeatFailed) return { pass: false, detail: "Heartbeat failed during ast-density", heartbeatFailed: true };
  if (!result.ok) return { pass: false, detail: result.output };
  return result.output.trim().length > 0
    ? { pass: false, detail: result.output }
    : { pass: true, detail: "" };
}

export async function runTests(projectRoot, opts = {}) {
  const result = await runCommand(VALIDATION_MANIFEST.tests.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.tests.timeoutMs,
    env: { ...process.env, ANQR_LOG_LEVEL: "error" },
    heartbeat: opts.heartbeat,
  });
  if (result.heartbeatFailed) return { pass: false, detail: "Heartbeat failed during tests", heartbeatFailed: true };
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}

export function formatValidationFeedback(validation) {
  const lines = [
    "⚠️ VALIDATION FAILED — your changes did not pass the validation pipeline. Fix the errors below.",
    "",
  ];
  for (const r of validation.results) {
    if (!r.pass) {
      lines.push(`### ${r.check}`, "```", String(r.detail || "").slice(0, 1500), "```", "");
    }
  }
  lines.push(
    "Fix ONLY the errors listed above.",
    "Run run_typecheck, run_lint, run_cspell, run_ast_density, and run_tests after your last code change.",
    "Then call task_complete when all checks pass.",
  );
  return lines.join("\n");
}

export async function runValidation(projectRoot, changedFiles = [], opts = {}) {
  const heartbeatOpts = opts.heartbeat ? { heartbeat: opts.heartbeat } : {};
  
  const results = [
    { check: "typecheck", ...(await runTypecheck(projectRoot, heartbeatOpts)) },
    { check: "lint", ...(await runLint(projectRoot, heartbeatOpts)) },
    { check: "cspell", ...(await runCspell(projectRoot, changedFiles, heartbeatOpts)) },
    { check: "ast-density", ...(await runAstDensity(projectRoot, changedFiles, heartbeatOpts)) },
    { check: "test-unit", ...(await runTests(projectRoot, heartbeatOpts)) },
  ];
  
  // Check if any validation failed due to heartbeat failure
  const heartbeatFailed = results.some((r) => r.heartbeatFailed);
  
  return {
    passed: results.every((r) => r.pass),
    results,
    heartbeatFailed,
    signature: results
      .filter((r) => !r.pass)
      .map((r) => `${r.check}:${String(r.detail || "").split("\n")[0]}`)
      .join("|"),
  };
}

export async function runGlobalPreflights(projectRoot, opts = {}) {
  const heartbeatOpts = opts.heartbeat ? { heartbeat: opts.heartbeat } : {};
  
  const tc = await runTypecheck(projectRoot, heartbeatOpts);
  if (!tc.pass) return { pass: false, check: "typecheck", detail: tc.detail };
  const lint = await runLint(projectRoot, heartbeatOpts);
  if (!lint.pass) return { pass: false, check: "lint", detail: lint.detail };
  const cspell = await runCspell(projectRoot, [], { fullProject: true, ...heartbeatOpts });
  if (!cspell.pass) return { pass: false, check: "cspell", detail: cspell.detail };
  const astDensity = await runAstDensity(projectRoot, [], { fullProject: true, ...heartbeatOpts });
  if (!astDensity.pass) return { pass: false, check: "ast-density", detail: astDensity.detail };
  return { pass: true };
}
