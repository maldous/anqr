#!/usr/bin/env node

/**
 * harness-report.mjs — Deterministic harness checks
 *
 * Runs local, deterministic checks against the repo and runtime environment.
 * Produces a structured JSON report to reports/latest.json.
 *
 * Profiles:
 *   quick       — fast sanity checks (<30s): repo-structure, typecheck, lint
 *   continuous  — background polling checks: repo-structure, ollama-health, litellm-routing
 *   full        — comprehensive audit: all checks (excludes test-unit, handled by Make pipeline)
 *
 * Exit code:
 *   0 = all checks passed
 *   1 = one or more checks failed
 *
 * Usage:
 *   node scripts/ops/harness-report.mjs quick
 *   node scripts/ops/harness-report.mjs full
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, statSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logError } = createLogger();

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");

const OLLAMA_BASE = process.env.OLLAMA_API_BASE || "http://localhost:11434";
const PINNED_MODEL = "qwen2.5-coder:3b-instruct";
const PING_TIMEOUT_MS = 5_000;
const DOCS_FRESHNESS_DAYS = 30;

const PROFILES = {
  quick: ["repo-structure", "typecheck", "lint", "cspell-coverage", "ast-density"],
  continuous: [
    "repo-structure",
    "ollama-health",
    "litellm-routing",
    "pipeline-latency",
    "linear-rag-pipeline",
  ],
  full: [
    "repo-structure",
    "typecheck",
    "lint",
    "depcruise",
    "cspell-coverage",
    "ast-density",
    "docs-freshness",
    "ollama-health",
    "litellm-routing",
    "sonar-audit",
    "pipeline-latency",
    "linear-rag-pipeline",
  ],
};

const REQUIRED_DIRS = ["src", "docs", "scripts/ops", "reports"];

const REQUIRED_FILES = [
  "tsconfig.json",
  "package.json",
  "vite.config.ts",
  ".dependency-cruiser.cjs",
  "oxlint.json",
];

const ALLOWED_ROOT_DIRS = new Set([
  "apps",
  "packages",
  "src",
  "tests",
  "tools",
  "netlify",
  "android",
  "ios",
  "docs",
  "scripts",
  "services",
  "reports",
  "node_modules",
  ".git",
  "dist",
  "coverage",
  "public",
  "test-results",
  "playwright-report",
  "migration",
  "vite-config",
  "memory",
]);

// ---------------------------------------------------------------------------
// Check implementations
// ---------------------------------------------------------------------------

function checkRepoStructure() {
  const issues = [];

  for (const dir of REQUIRED_DIRS) {
    const full = resolve(ROOT, dir);
    if (!existsSync(full)) {
      issues.push(`missing required directory: ${dir}/`);
    }
  }

  for (const file of REQUIRED_FILES) {
    const full = resolve(ROOT, file);
    if (!existsSync(full)) {
      issues.push(`missing required file: ${file}`);
    }
  }

  const topLevel = readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const unexpected = topLevel.filter((d) => !ALLOWED_ROOT_DIRS.has(d) && !d.startsWith("."));
  if (unexpected.length > 0) {
    issues.push(`unexpected root directories: ${unexpected.join(", ")}`);
  }

  return {
    pass: issues.length === 0,
    detail:
      issues.length === 0
        ? `All required dirs/files present, no unexpected root directories`
        : issues.join("; "),
  };
}

function checkNpmScript(scriptName, label, timeout_ms = 120_000) {
  try {
    execFileSync("npm", ["run", scriptName], {
      cwd: ROOT,
      stdio: "pipe",
      timeout: timeout_ms,
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    return { pass: true, detail: `${label} passed` };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : "";
    const stdout = err.stdout ? err.stdout.toString().trim() : "";
    const output = stderr || stdout;
    const lines = output.split("\n");
    const summary =
      lines.length > 5
        ? lines.slice(0, 3).join("\n") + "\n... (" + (lines.length - 3) + " more lines)"
        : output;
    const fallback = `exit code ${err.status}`;
    return { pass: false, detail: `${label} failed: ${summary || fallback}` };
  }
}

function checkTypecheck() {
  return checkNpmScript("typecheck", "tsc --noEmit");
}

function checkLint() {
  return checkNpmScript("lint", "oxlint");
}

function checkTestUnit() {
  // Not included in any profile — unit tests run via Make's test-unit-coverage target.
  // Kept for standalone/programmatic use: node harness-report.mjs with a custom profile.
  return checkNpmScript("test:unit", "vitest", 300_000);
}

function checkDepcruise() {
  return checkNpmScript("depcruise", "dependency-cruiser");
}

function checkDocsFreshness() {
  const docsDir = resolve(ROOT, "docs");
  if (!existsSync(docsDir)) {
    return { pass: false, detail: "docs/ directory missing" };
  }

  const staleFiles = [];
  const cutoff = Date.now() - DOCS_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        const mtime = statSync(full).mtimeMs;
        if (mtime < cutoff) {
          const rel = full.slice(ROOT.length + 1);
          const daysAgo = Math.floor((Date.now() - mtime) / (24 * 60 * 60 * 1000));
          staleFiles.push(`${rel} (${daysAgo}d)`);
        }
      }
    }
  }

  walk(docsDir);

  if (staleFiles.length === 0) {
    return { pass: true, detail: `All docs modified within ${DOCS_FRESHNESS_DAYS} days` };
  }

  const shown = staleFiles.slice(0, 5);
  const suffix = staleFiles.length > 5 ? ` ... and ${staleFiles.length - 5} more` : "";
  return {
    pass: false,
    detail: `${staleFiles.length} stale docs (>${DOCS_FRESHNESS_DAYS}d): ${shown.join(", ")}${suffix}`,
  };
}

async function checkOllamaHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/version`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();

    const tagsController = new AbortController();
    const tagsTimer = setTimeout(() => tagsController.abort(), PING_TIMEOUT_MS);
    const tagsRes = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: tagsController.signal });
    clearTimeout(tagsTimer);
    const tagsData = await tagsRes.json();
    const models = (tagsData.models || []).map((m) => m.name);
    const found = models.includes(PINNED_MODEL);

    if (found) {
      return { pass: true, detail: `Ollama v${data.version} running, ${PINNED_MODEL} available` };
    }
    return {
      pass: false,
      detail: `Ollama v${data.version} running but ${PINNED_MODEL} not found. Available: ${models.join(", ") || "none"}`,
    };
  } catch (err) {
    return { pass: false, detail: `Ollama unreachable at ${OLLAMA_BASE}: ${err.message}` };
  }
}

function checkAstDensity() {
  try {
    const output = execFileSync("node", ["scripts/audit-ast-density.mjs", "--threshold", "1"], {
      cwd: ROOT,
      timeout: 120_000,
      stdio: "pipe",
      encoding: "utf-8",
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    if (output.trim().length === 0) {
      return {
        pass: true,
        detail: "All files within density threshold (≤1 top-level declaration)",
      };
    }
    const lines = output.trim().split("\n");
    const fileSummary = lines
      .slice(0, 5)
      .map((l) => l.trim().split(/\s+/)[1])
      .join(", ");
    const suffix = lines.length > 5 ? ` ... and ${lines.length - 5} more` : "";
    return {
      pass: false,
      detail: `${lines.length} files exceed density threshold: ${fileSummary}${suffix}`,
    };
  } catch (err) {
    const stderr = (err.stderr || "").toString().trim();
    return { pass: false, detail: `AST density audit error: ${stderr.slice(0, 500)}` };
  }
}

async function checkSonarAudit() {
  const SONAR_TOKEN = process.env.SONAR_TOKEN;
  const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";

  if (!SONAR_TOKEN) {
    return { pass: true, detail: "SONAR_TOKEN not set — skipped" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const authHeader = `Basic ${Buffer.from(SONAR_TOKEN + ":").toString("base64")}`;
    const headers = { Authorization: authHeader };

    const statusRes = await fetch(`${SONAR_HOST}/api/system/status`, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timer);
    const status = await statusRes.json();
    if (status.status !== "UP") {
      return { pass: true, detail: `SonarQube status: ${status.status} — skipped` };
    }

    const issuesRes = await fetch(
      `${SONAR_HOST}/api/issues/search?componentKeys=anqr&resolved=false&ps=1`,
      { headers },
    );
    const issuesData = await issuesRes.json();
    const totalIssues = issuesData.total || 0;

    const hotRes = await fetch(`${SONAR_HOST}/api/hotspots/search?projectKey=anqr&ps=1`, {
      headers,
    });
    const hotData = await hotRes.json();
    const totalHotspots = hotData.paging?.total || 0;

    const measRes = await fetch(
      `${SONAR_HOST}/api/measures/component?component=anqr&metricKeys=bugs,vulnerabilities,code_smells,duplicated_lines_density,coverage`,
      { headers },
    );
    const measData = await measRes.json();
    const measures = (measData.component?.measures || [])
      .map((m) => `${m.metric}=${m.value}`)
      .join(", ");

    const measuresSuffix = measures ? ` | ${measures}` : "";
    const detail = `Issues: ${totalIssues}, Hotspots: ${totalHotspots}${measuresSuffix}`;
    return { pass: true, detail };
  } catch (err) {
    return { pass: true, detail: `SonarQube unreachable: ${err.message}` };
  }
}

function checkCspellCoverage() {
  const result = spawnSync(
    "npx",
    ["cspell", "--no-progress", "src/**/*.{ts,tsx}", "scripts/**/*.{mjs,js}", "docs/**/*.md"],
    {
      cwd: ROOT,
      timeout: 120_000,
      encoding: "utf-8",
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );
  const output = `${result.stdout || ""}${result.stderr || ""}`;

  if (result.status === 0) {
    const summaryMatch = output.match(/Files checked:\s*(\d+)/);
    const filesChecked = summaryMatch ? summaryMatch[1] : "?";
    return { pass: true, detail: `${filesChecked} files checked, 0 spelling issues` };
  }

  const summaryMatch = output.match(
    /Files checked:\s*(\d+)[\s\S]*?Issues found:\s*(\d+)\s*in\s*(\d+)/,
  );
  const filesChecked = summaryMatch ? summaryMatch[1] : "?";
  const issueCount = summaryMatch ? summaryMatch[2] : "?";
  const fileCount = summaryMatch ? summaryMatch[3] : "?";

  const wordMatches = [...output.matchAll(/Unknown word \(([^)]+)\)/g)];
  const uniqueWords = [...new Set(wordMatches.map((m) => m[1]))].sort();

  const wordSummary =
    uniqueWords.length <= 10
      ? uniqueWords.join(", ")
      : uniqueWords.slice(0, 10).join(", ") + ` ... and ${uniqueWords.length - 10} more`;

  return {
    pass: false,
    detail: `${issueCount} issues in ${fileCount}/${filesChecked} files. Unknown words: ${wordSummary}`,
  };
}

function checkLitellmRouting() {
  const configPath = resolve(ROOT, "scripts/ops/integrations/model/litellm-config.yaml");
  if (!existsSync(configPath)) {
    return { pass: false, detail: "integrations/model/litellm-config.yaml missing" };
  }

  const content = readFileSync(configPath, "utf-8");

  if (!content.includes("symphony-local")) {
    return {
      pass: false,
      detail: "integrations/model/litellm-config.yaml missing symphony-local alias",
    };
  }

  if (!content.includes(PINNED_MODEL)) {
    return {
      pass: false,
      detail: `integrations/model/litellm-config.yaml does not reference pinned model ${PINNED_MODEL}`,
    };
  }

  const proxyPath = resolve(ROOT, "scripts/ops/model-injector-proxy.py");
  if (!existsSync(proxyPath)) {
    return { pass: false, detail: "model-injector-proxy.py missing" };
  }

  return {
    pass: true,
    detail:
      "Integration-owned LiteLLM config is valid, symphony-local alias present, injector proxy exists",
  };
}

async function checkPipelineLatency() {
  try {
    const { getLatencyMetrics, checkLatencyBaseline } = await import("../core/symphony-state.mjs");
    const metrics = getLatencyMetrics();

    if (metrics.count === 0) {
      return { pass: true, detail: "No completed tasks yet — latency baseline not established" };
    }

    const avgMinutes = (metrics.averageMs / 60000).toFixed(1);
    const p95Minutes = (metrics.p95Ms / 60000).toFixed(1);
    const targetMs = 10 * 60 * 1000; // 10 min target
    const acceptableMs = 30 * 60 * 1000; // 30 min acceptable

    const baselineCheck = checkLatencyBaseline(metrics.averageMs);

    // Alert conditions:
    // 1. Average latency > 30 min (acceptable threshold)
    // 2. >50% increase from baseline
    const exceedsAcceptable = metrics.averageMs > acceptableMs;
    const baselineAlert = baselineCheck.alert;

    if (exceedsAcceptable || baselineAlert) {
      const reasons = [];
      if (exceedsAcceptable)
        reasons.push(`avg ${avgMinutes}min exceeds 30min acceptable threshold`);
      if (baselineAlert) reasons.push(`${baselineCheck.increase}% increase from baseline`);

      return {
        pass: false,
        detail: `⚠️ Latency alert: ${reasons.join(", ")} | p95=${p95Minutes}min, n=${metrics.count}`,
      };
    }

    const exceedsTarget = metrics.averageMs > targetMs;
    const status = exceedsTarget ? "⚠️" : "✅";

    return {
      pass: true,
      detail: `${status} avg=${avgMinutes}min, p95=${p95Minutes}min, n=${metrics.count} (target ≤10min, acceptable ≤30min)`,
    };
  } catch (err) {
    return { pass: true, detail: `Latency tracking unavailable: ${err.message}` };
  }
}

async function checkLinearRagPipeline() {
  const exportFile = resolve(ROOT, "reports/linear-export/issues-latest.json");
  const indexDir = resolve(ROOT, "reports/rag-index-linear");
  const indexFile = resolve(indexDir, "index.json");
  const metaFile = resolve(indexDir, "meta.json");

  const exportExists = existsSync(exportFile);
  const indexExists = existsSync(indexFile);
  const metaExists = existsSync(metaFile);

  if (!exportExists && !indexExists) {
    return { pass: true, detail: "Linear RAG not yet configured — skipped" };
  }

  const issues = [];
  let exportStats = null;
  let indexStats = null;

  // Check export file
  if (exportExists) {
    try {
      const exportData = JSON.parse(readFileSync(exportFile, "utf-8"));
      const exportStat = statSync(exportFile);
      const exportAge = Math.floor((Date.now() - exportStat.mtimeMs) / (60 * 60 * 1000));
      exportStats = {
        count: Array.isArray(exportData) ? exportData.length : 0,
        ageHours: exportAge,
      };

      if (exportAge > 48) {
        issues.push(`export stale (${exportAge}h old)`);
      }
    } catch (err) {
      issues.push(`export invalid: ${err.message}`);
    }
  } else {
    issues.push("export missing");
  }

  // Check index
  if (indexExists && metaExists) {
    try {
      const meta = JSON.parse(readFileSync(metaFile, "utf-8"));
      const indexStat = statSync(indexFile);
      const indexAge = Math.floor((Date.now() - indexStat.mtimeMs) / (60 * 60 * 1000));
      indexStats = {
        chunks: meta.chunkCount || 0,
        ageHours: indexAge,
        sizeKB: Math.floor((meta.indexSizeBytes || 0) / 1024),
      };

      if (indexAge > 48) {
        issues.push(`index stale (${indexAge}h old)`);
      }

      if (exportStats && indexStats.chunks < exportStats.count * 0.9) {
        issues.push(
          `chunk count mismatch (${indexStats.chunks} chunks vs ${exportStats.count} issues)`,
        );
      }
    } catch (err) {
      issues.push(`index invalid: ${err.message}`);
    }
  } else if (exportExists) {
    issues.push("index missing");
  }

  if (issues.length > 0) {
    return { pass: false, detail: issues.join("; ") };
  }

  const exportDetail = exportStats
    ? `${exportStats.count} issues (${exportStats.ageHours}h)`
    : "N/A";
  const indexDetail = indexStats
    ? `${indexStats.chunks} chunks, ${indexStats.sizeKB}KB (${indexStats.ageHours}h)`
    : "N/A";

  return {
    pass: true,
    detail: `Export: ${exportDetail} | Index: ${indexDetail}`,
  };
}

// ---------------------------------------------------------------------------
// Check registry
// ---------------------------------------------------------------------------

const CHECKS = {
  "repo-structure": { fn: checkRepoStructure, async: false },
  typecheck: { fn: checkTypecheck, async: false },
  lint: { fn: checkLint, async: false },
  "test-unit": { fn: checkTestUnit, async: false },
  depcruise: { fn: checkDepcruise, async: false },
  "docs-freshness": { fn: checkDocsFreshness, async: false },
  "ollama-health": { fn: checkOllamaHealth, async: true },
  "litellm-routing": { fn: checkLitellmRouting, async: false },
  "cspell-coverage": { fn: checkCspellCoverage, async: false },
  "ast-density": { fn: checkAstDensity, async: false },
  "sonar-audit": { fn: checkSonarAudit, async: true },
  "pipeline-latency": { fn: checkPipelineLatency, async: true },
  "linear-rag-pipeline": { fn: checkLinearRagPipeline, async: true },
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function runCheck(name) {
  const check = CHECKS[name];
  if (!check) {
    return { name, pass: false, detail: `Unknown check: ${name}`, duration_ms: 0 };
  }

  const start = Date.now();
  const result = check.async ? await check.fn() : check.fn();
  const duration_ms = Date.now() - start;

  return {
    name,
    pass: result.pass,
    detail: result.detail,
    duration_ms,
  };
}

async function main() {
  const profile = process.argv[2] || "quick";

  if (!PROFILES[profile]) {
    logError(`Unknown profile: ${profile}`);
    logError(`Available profiles: ${Object.keys(PROFILES).join(", ")}`);
    process.exit(2);
  }

  const checkNames = PROFILES[profile];
  logInfo(`[harness-report] profile=${profile} checks=${checkNames.length}\n`);

  const results = [];
  for (const name of checkNames) {
    const result = await runCheck(name);
    const icon = result.pass ? "✅" : "❌";
    const timing =
      result.duration_ms > 1000
        ? `${(result.duration_ms / 1000).toFixed(1)}s`
        : `${result.duration_ms}ms`;
    logInfo(`${icon} ${result.name} (${timing}): ${result.detail}`);
    results.push(result);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const total = results.length;
  const total_duration_ms = results.reduce((sum, r) => sum + r.duration_ms, 0);

  const report = {
    profile,
    timestamp: new Date().toISOString(),
    total_duration_ms,
    summary: { passed, failed, total },
    checks: results,
  };

  const reportsDir = resolve(ROOT, "reports");
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = resolve(reportsDir, "latest.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

  logInfo(
    `\n[harness-report] ${passed}/${total} passed, ${failed} failed (${(total_duration_ms / 1000).toFixed(1)}s)`,
  );
  logInfo(`[harness-report] report written to reports/latest.json`);

  process.exit(failed > 0 ? 1 : 0);
}

await main();
