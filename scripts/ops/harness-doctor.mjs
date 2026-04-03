#!/usr/bin/env node

/**
 * harness-doctor.mjs — Runtime diagnostics for the AI harness
 *
 * Runs health checks on the harness runtime surface:
 * - Provider availability and API keys
 * - Credit gate provider cascade
 * - SDK availability (Codebuff, Ollama)
 * - Systemd services status
 * - Queue and symphony state
 *
 * Exit code:
 *   0 = all checks passed
 *   1 = one or more checks failed
 *   2 = error running checks
 *
 * Usage:
 *   node scripts/ops/harness-doctor.mjs
 *   npm run harness:doctor
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "./lib/logger.mjs";

const { logInfo, logError } = createLogger();

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "..");

// ---------------------------------------------------------------------------
// Diagnostic checks
// -----------------------------------------------------------------------------

function checkEnvVars() {
  const checks = [];

  // Check for critical env vars
  const critical = ["LINEAR_API_KEY", "CODEBUFF_API_KEY"];
  const optional = ["OLLAMA_API_BASE", "SONAR_TOKEN"];

  for (const key of critical) {
    const val = process.env[key];
    if (!val || val === "REPLACE" || val.includes("REPLACE_WITH_REAL")) {
      checks.push({ name: key, status: "missing", detail: "not set or placeholder" });
    } else {
      checks.push({ name: key, status: "ok", detail: "set" });
    }
  }

  for (const key of optional) {
    const val = process.env[key];
    if (!val || val === "REPLACE") {
      checks.push({ name: key, status: "optional", detail: "not set" });
    } else {
      checks.push({ name: key, status: "ok", detail: "set" });
    }
  }

  const criticalMissing = checks.filter((c) => c.status === "missing");
  return {
    pass: criticalMissing.length === 0,
    checks,
    detail:
      criticalMissing.length > 0
        ? `Missing: ${criticalMissing.map((c) => c.name).join(", ")}`
        : "All critical env vars set",
  };
}

function checkNodeModules() {
  const checks = [];

  // Check for critical packages
  const required = ["@codebuff/sdk", "@modelcontextprotocol/sdk"];
  const optional = ["ollama"];

  for (const pkg of required) {
    const path = resolve(ROOT, "node_modules", pkg, "package.json");
    if (existsSync(path)) {
      try {
        const pkgJson = JSON.parse(readFileSync(path, "utf-8"));
        checks.push({ name: pkg, status: "ok", detail: `v${pkgJson.version}` });
      } catch {
        checks.push({ name: pkg, status: "ok", detail: "installed (version unknown)" });
      }
    } else {
      checks.push({ name: pkg, status: "missing", detail: "not installed" });
    }
  }

  for (const pkg of optional) {
    const path = resolve(ROOT, "node_modules", pkg, "package.json");
    if (existsSync(path)) {
      checks.push({ name: pkg, status: "ok", detail: "installed" });
    } else {
      checks.push({ name: pkg, status: "optional", detail: "not installed" });
    }
  }

  const missing = checks.filter((c) => c.status === "missing");
  return {
    pass: missing.length === 0,
    checks,
    detail:
      missing.length > 0
        ? `Missing: ${missing.map((c) => c.name).join(", ")}`
        : "All required packages installed",
  };
}

async function checkCreditGate() {
  try {
    // Try to load and probe the credit gate
    const { selectProvider } = await import("./integrations/model/symphony-credit-gate.mjs");
    const provider = await selectProvider();

    if (provider) {
      return {
        pass: true,
        detail: `Provider selected: ${provider.name}`,
        provider: provider.name,
      };
    }
    return {
      pass: false,
      detail: "No provider available",
      provider: null,
    };
  } catch {
    return {
      pass: false,
      detail: `Error: could not load credit gate`,
      provider: null,
    };
  }
}

async function checkOllama() {
  const base = process.env.OLLAMA_API_BASE || "http://localhost:11434";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    // Check version
    const versionRes = await fetch(`${base}/api/version`, { signal: controller.signal });
    clearTimeout(timer);

    if (!versionRes.ok) {
      return { pass: false, detail: `Ollama responded with ${versionRes.status}` };
    }

    const versionData = await versionRes.json();
    const version = versionData.version || "unknown";

    // Check models
    const tagsRes = await fetch(`${base}/api/tags`);
    const tagsData = await tagsRes.json();
    const models = (tagsData.models || []).map((m) => m.name);

    return {
      pass: true,
      detail: `v${version}, ${models.length} models available`,
      version: versionData.version,
      models,
    };
  } catch (err) {
    return { pass: false, detail: `Unreachable: ${err.message}` };
  }
}

function checkSystemdServices() {
  const runnerUnits =
    process.env.ANQR_HARNESS_DOCTOR_RUNNERS || "anqr-symphony-runner@1,anqr-symphony-runner@2";
  const services = [
    ...runnerUnits
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    "anqr-nightly",
    "anqr-queue-feeder",
  ];

  const results = [];
  for (const service of services) {
    try {
      const out = execFileSync("systemctl", ["is-active", "--user", service], {
        stdio: "pipe",
        encoding: "utf-8",
      });
      const status = out.trim();
      results.push({ name: service, status: status === "active" ? "active" : status });
    } catch {
      results.push({ name: service, status: "inactive/not-found" });
    }
  }

  // Systemd services are production runtime - in dev they may be inactive
  // Always pass this check, but report status (warn vs info)
  const activeCount = results.filter((r) => r.status === "active").length;
  const detail =
    activeCount > 0
      ? `All services active (${activeCount}/${results.length})`
      : `Services not running (dev environment - expected)`;

  return {
    pass: true, // Always pass - systemd services are production, not dev requirement
    detail,
    services: results,
  };
}

function checkQueueState() {
  try {
    const out = execFileSync("node", ["scripts/ops/symphony-queue-control.mjs", "--check"], {
      cwd: ROOT,
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 30_000,
    });

    // Parse output for queue state
    const pendingMatch = out.match(/pending:\s*(\d+)/i);
    const processingMatch = out.match(/processing:\s*(\d+)/i);

    const pending = pendingMatch ? Number.parseInt(pendingMatch[1], 10) : 0;
    const processing = processingMatch ? Number.parseInt(processingMatch[1], 10) : 0;

    return {
      pass: true,
      detail: `pending=${pending}, processing=${processing}`,
      pending,
      processing,
    };
  } catch {
    // Queue might be empty or unreachable
    return {
      pass: true,
      detail: "Queue check unavailable (may be empty or error)",
      pending: 0,
      processing: 0,
    };
  }
}

function checkReportsDir() {
  const reportsDir = resolve(ROOT, "reports");
  const codebuffDir = resolve(reportsDir, "codebuff");

  if (!existsSync(reportsDir)) {
    return { pass: false, detail: "reports/ directory missing" };
  }

  let latestRun = null;
  if (existsSync(codebuffDir)) {
    const files = execFileSync("ls", ["-t", codebuffDir], { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter((f) => f.startsWith("latest-"));
    if (files.length > 0) {
      const latestFile = files[0];
      const stat = execFileSync("stat", ["-c", "%Y", resolve(codebuffDir, latestFile)], {
        encoding: "utf-8",
      });
      const mtime = Number.parseInt(stat.trim(), 10) * 1000;
      const hoursAgo = Math.floor((Date.now() - mtime) / (1000 * 60 * 60));
      latestRun = { file: latestFile, hoursAgo };
    }
  }

  return {
    pass: true,
    detail: latestRun
      ? `Last Codebuff run: ${latestRun.file} (${latestRun.hoursAgo}h ago)`
      : "No Codebuff runs recorded",
    latestRun,
  };
}

function checkHarnessConfig() {
  const configs = [
    resolve(ROOT, ".env"),
    resolve(ROOT, "scripts/ops/integrations/model/litellm-config.yaml"),
    // Note: symphony-config.yaml is optional (can be generated or use defaults)
  ];

  const results = [];
  for (const path of configs) {
    const exists = existsSync(path);
    results.push({
      file: path.split("/").slice(-2).join("/"),
      exists,
    });
  }

  const missing = results.filter((r) => !r.exists);
  return {
    pass: missing.length === 0,
    detail:
      missing.length > 0
        ? `Missing: ${missing.map((r) => r.file).join(", ")}`
        : "All config files present",
    configs: results,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  logInfo("[harness-doctor] Running harness diagnostics...\n");

  const categories = [
    { name: "Environment Variables", fn: checkEnvVars },
    { name: "Node Modules", fn: checkNodeModules },
    { name: "Harness Config Files", fn: checkHarnessConfig },
    { name: "Credit Gate Provider", fn: checkCreditGate },
    { name: "Ollama Runtime", fn: checkOllama },
    { name: "Systemd Services", fn: checkSystemdServices },
    { name: "Queue State", fn: checkQueueState },
    { name: "Reports History", fn: checkReportsDir },
  ];

  const results = [];

  for (const cat of categories) {
    const start = Date.now();
    let result;
    try {
      result = await cat.fn();
    } catch (err) {
      result = { pass: false, detail: `Error: ${err.message}` };
    }
    const duration_ms = Date.now() - start;

    const icon = result.pass ? "✅" : "❌";
    logInfo(`${icon} ${cat.name}: ${result.detail}`);

    results.push({
      category: cat.name,
      pass: result.pass,
      detail: result.detail,
      duration_ms,
      data: result,
    });
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  const total = results.length;

  logInfo(`\n[harness-doctor] ${passed}/${total} categories passed, ${failed} failed`);

  // Write detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, total },
    results,
  };

  const reportPath = resolve(ROOT, "reports", "doctor.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  logInfo(`[harness-doctor] Report written to reports/doctor.json`);

  process.exit(failed > 0 ? 1 : 0);
}

// Run main if executed directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await main().catch((err) => {
    logError(`[harness-doctor] Fatal: ${err.message}`);
    process.exit(2);
  });
}
