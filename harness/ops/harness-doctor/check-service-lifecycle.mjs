import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

import { validateTimerSchedules } from "./validate-timer-schedules.mjs";
import { validateDependencyChains } from "./validate-dependency-chains.mjs";

/**
 * Check service lifecycle health — enforces systemd topology invariants.
 *
 * Checks:
 * 1. Critical services use required EnvironmentFile= (no dash) for essential env
 * 2. Executor instances 1-8 have symlinks in default.target.wants/
 * 3. Timer units have matching .service units
 * 4. Long-running services have Restart= directives
 * 5. BRIDGE_MODE is set correctly for executor and codex
 * 6. Timer schedules have safe minimum gaps (no dangerous overlaps)
 * 7. Requires= dependencies point to existing service files
 *
 * Accepts optional param overrides for testability.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.enforce] — throw on critical violations instead of returning
 * @param {string} [opts.servicesDir] — override services directory path
 * @param {string} [opts.wantsDir] — override default.target.wants directory path
 * @returns {Promise<{pass: boolean, detail: string, issues: string[], criticalIssues: string[], advisoryIssues: string[]}>}
 * @throws {Error} When enforce=true and critical violations exist
 */
export async function checkServiceLifecycle({
  enforce = false,
  servicesDir: servicesDirOverride,
  wantsDir: wantsDirOverride,
} = {}) {
  let servicesDir = servicesDirOverride;
  let wantsDir = wantsDirOverride;

  if (!servicesDir) {
    const { ROOT } = await import("./root.mjs");
    servicesDir = resolve(ROOT, "services/systemd");
    wantsDir = wantsDir || resolve(ROOT, "services/systemd/default.target.wants");
  }
  if (!wantsDir) {
    wantsDir = resolve(servicesDir, "default.target.wants");
  }

  if (!existsSync(servicesDir)) {
    const msg = "services/systemd directory missing";
    if (enforce) throw new Error(`FATAL: ${msg}`);
    return { pass: false, detail: msg, issues: [msg], criticalIssues: [msg], advisoryIssues: [] };
  }

  const criticalIssues = [];
  const advisoryIssues = [];

  const serviceFiles = readdirSync(servicesDir).filter(
    (f) => f.endsWith(".service") && !f.includes("@."),
  );
  const timerFiles = readdirSync(servicesDir).filter((f) => f.endsWith(".timer"));
  const wantsFiles = existsSync(wantsDir) ? readdirSync(wantsDir) : [];

  // --- Check 1: Critical services must use required EnvironmentFile (CRITICAL) ---
  const criticalServices = [
    "anqr-symphony-router.service",
    "anqr-discord-router.service",
    "anqr-linear-webhook.service",
  ];

  for (const svc of criticalServices) {
    const svcPath = join(servicesDir, svc);
    if (!existsSync(svcPath)) continue;
    const content = readFileSync(svcPath, "utf-8");
    if (!content.match(/^EnvironmentFile=%h\/\.config\/systemd\/user\/anqr-ops\.env$/m)) {
      if (content.includes("EnvironmentFile=-%h/.config/systemd/user/anqr-ops.env")) {
        criticalIssues.push(
          `${svc}: uses optional EnvironmentFile=- for anqr-ops.env — must be required (no dash)`,
        );
      } else {
        criticalIssues.push(`${svc}: missing EnvironmentFile for anqr-ops.env`);
      }
    }
  }

  // --- Check 2: Executor instances in default.target.wants (ADVISORY) ---
  for (let i = 1; i <= 8; i++) {
    const expected = `anqr-symphony-executor@${i}.service`;
    if (!wantsFiles.includes(expected)) {
      advisoryIssues.push(`Executor ${expected} missing from default.target.wants/`);
    }
  }

  // --- Check 3: Timer units have matching service units (ADVISORY) ---
  for (const timer of timerFiles) {
    const expectedService = timer.replace(".timer", ".service");
    if (!serviceFiles.includes(expectedService)) {
      advisoryIssues.push(`Timer ${timer} has no matching ${expectedService}`);
    }
  }

  // --- Check 4: Long-running services have Restart= (ADVISORY) ---
  const longRunningServices = serviceFiles.filter(
    (f) =>
      !f.includes("export") &&
      !f.includes("nightly") &&
      !f.includes("email-ingest") &&
      !f.includes("rag-rebuild") &&
      !f.includes("worktree-health"),
  );

  for (const svc of longRunningServices) {
    const svcPath = join(servicesDir, svc);
    if (!existsSync(svcPath)) continue;
    const content = readFileSync(svcPath, "utf-8");
    if (!content.includes("Restart=")) {
      advisoryIssues.push(`${svc}: missing Restart= directive`);
    }
  }

  // --- Check 5: BRIDGE_MODE set correctly (CRITICAL) ---
  const executorTemplatePath = join(servicesDir, "anqr-symphony-executor@.service");
  if (existsSync(executorTemplatePath)) {
    const executorContent = readFileSync(executorTemplatePath, "utf-8");
    if (!executorContent.includes("BRIDGE_MODE=worktree")) {
      criticalIssues.push("executor template: missing BRIDGE_MODE=worktree");
    }
  }
  const codexPath = join(servicesDir, "anqr-symphony-codex.service");
  if (existsSync(codexPath)) {
    const codexContent = readFileSync(codexPath, "utf-8");
    if (!codexContent.includes("BRIDGE_MODE=control-plane")) {
      criticalIssues.push("codex service: missing BRIDGE_MODE=control-plane");
    }
  }

  // --- Check 6: Timer schedule overlap safety (CRITICAL) ---
  const timerIssues = validateTimerSchedules(servicesDir);
  criticalIssues.push(...timerIssues);

  // --- Check 7: Dependency chain validation (CRITICAL) ---
  const depIssues = validateDependencyChains(servicesDir);
  criticalIssues.push(...depIssues);

  // --- Enforcement ---
  if (enforce && criticalIssues.length > 0) {
    throw new Error(
      `FATAL: ${criticalIssues.length} critical service lifecycle violation(s): ${criticalIssues.join("; ")}`,
    );
  }

  const allIssues = [...criticalIssues, ...advisoryIssues];
  const pass = allIssues.length === 0;
  const detail = pass
    ? `Service lifecycle checks passed (${serviceFiles.length} services, ${timerFiles.length} timers)`
    : allIssues.join("; ");

  return { pass, detail, issues: allIssues, criticalIssues, advisoryIssues };
}
