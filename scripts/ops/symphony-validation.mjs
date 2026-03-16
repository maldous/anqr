#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from "node:child_process";
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
  return crypto.createHash("sha1").update(JSON.stringify(VALIDATION_MANIFEST)).digest("hex");
}

function trimOutput(text, max = 6000) {
  const value = String(text || "").trim();
  return value.length > max ? `${value.slice(0, max)}\n... (truncated)` : value;
}

function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 2 * 1024 * 1024,
      ...options,
    });
    return { ok: true, output: trimOutput(output) };
  } catch (err) {
    const stdout = (err.stdout || "").toString();
    const stderr = (err.stderr || "").toString();
    return { ok: false, output: trimOutput(`${stdout}\n${stderr}`) };
  }
}

export function runTypecheck(projectRoot) {
  const result = runCommand(VALIDATION_MANIFEST.typecheck.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.typecheck.timeoutMs,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
  });
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}

export function runLint(projectRoot) {
  const result = runCommand(VALIDATION_MANIFEST.lint.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.lint.timeoutMs,
  });
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

export function runCspell(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.cspell.extensions);
  const targets = opts.fullProject
    ? VALIDATION_MANIFEST.cspell.fullProjectGlobs
    : eligible.map((file) => JSON.stringify(file));
  if (targets.length === 0) return { pass: true, detail: "" };
  const result = runCommand(`${VALIDATION_MANIFEST.cspell.command} ${targets.join(" ")}`, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.cspell.timeoutMs,
  });
  return result.ok ? { pass: true, detail: "" } : { pass: false, detail: result.output };
}

export function runAstDensity(projectRoot, changedFiles = [], opts = {}) {
  const eligible = filterChangedFiles(changedFiles, VALIDATION_MANIFEST.astDensity.extensions);
  const quoted = opts.fullProject ? "" : eligible.map((file) => JSON.stringify(file)).join(" ");
  if (!opts.fullProject && eligible.length === 0) return { pass: true, detail: "" };
  const result = runCommand(
    `${VALIDATION_MANIFEST.astDensity.command}${quoted ? ` ${quoted}` : ""}`,
    {
      cwd: projectRoot,
      timeout: VALIDATION_MANIFEST.astDensity.timeoutMs,
    },
  );
  if (!result.ok) return { pass: false, detail: result.output };
  return result.output.trim().length > 0
    ? { pass: false, detail: result.output }
    : { pass: true, detail: "" };
}

export function runTests(projectRoot) {
  const result = runCommand(VALIDATION_MANIFEST.tests.command, {
    cwd: projectRoot,
    timeout: VALIDATION_MANIFEST.tests.timeoutMs,
    env: { ...process.env, ANQR_LOG_LEVEL: "error" },
  });
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

export function runValidation(projectRoot, changedFiles = []) {
  const results = [];
  results.push({ check: "typecheck", ...runTypecheck(projectRoot) });
  results.push({ check: "lint", ...runLint(projectRoot) });
  results.push({ check: "cspell", ...runCspell(projectRoot, changedFiles) });
  results.push({ check: "ast-density", ...runAstDensity(projectRoot, changedFiles) });
  results.push({ check: "test-unit", ...runTests(projectRoot) });
  return {
    passed: results.every((r) => r.pass),
    results,
    signature: results
      .filter((r) => !r.pass)
      .map((r) => `${r.check}:${String(r.detail || "").split("\n")[0]}`)
      .join("|"),
  };
}

export function runGlobalPreflights(projectRoot) {
  const tc = runTypecheck(projectRoot);
  if (!tc.pass) return { pass: false, check: "typecheck", detail: tc.detail };
  const lint = runLint(projectRoot);
  if (!lint.pass) return { pass: false, check: "lint", detail: lint.detail };
  const cspell = runCspell(projectRoot, [], { fullProject: true });
  if (!cspell.pass) return { pass: false, check: "cspell", detail: cspell.detail };
  const astDensity = runAstDensity(projectRoot, [], { fullProject: true });
  if (!astDensity.pass) return { pass: false, check: "ast-density", detail: astDensity.detail };
  return { pass: true };
}
