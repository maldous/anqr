import { generateEnvConfig } from "./generate-env-config.mjs";
import { checkServiceLifecycle } from "./check-service-lifecycle.mjs";

/**
 * Fail-closed config preflight — blocks unsafe operations when config or
 * service topology is invalid.
 *
 * Combines:
 * 1. Config surface alignment (all env surfaces vs authoritative template)
 * 2. Service lifecycle enforcement (critical systemd topology invariants)
 *
 * Throws on ANY violation. Designed to be called before service startup
 * or `systemctl --user daemon-reload`.
 *
 * Accepts optional param overrides for testability.
 *
 * @param {object} [opts]
 * @param {string} [opts.templatePath]
 * @param {Array<{name: string, path: string}>} [opts.surfaces]
 * @param {string} [opts.servicesDir]
 * @param {string} [opts.wantsDir]
 * @returns {Promise<{pass: true, detail: string, configResult: object, lifecycleResult: object}>}
 * @throws {Error} When any critical violation exists
 */
export async function enforceConfigPreflight({
  templatePath,
  surfaces,
  servicesDir,
  wantsDir,
} = {}) {
  const violations = [];

  // 1. Config surface alignment
  const configResult = await generateEnvConfig({
    mode: "validate",
    templatePath,
    surfaces,
  });
  if (!configResult.pass) {
    violations.push(`Config surface drift: ${configResult.detail}`);
  }

  // 2. Service lifecycle enforcement (enforce=true throws on critical issues)
  let lifecycleResult;
  try {
    lifecycleResult = await checkServiceLifecycle({ enforce: true, servicesDir, wantsDir });
    // If we reach here, enforce mode found no critical issues.
    // Advisory issues are still reported in the result but don't block.
  } catch (err) {
    violations.push(`Service lifecycle: ${err.message}`);
    lifecycleResult = { pass: false, detail: err.message, issues: [err.message] };
  }

  if (violations.length > 0) {
    throw new Error(
      `Config preflight failed (${violations.length} violation(s)):\n` +
        violations.map((v, i) => `  ${i + 1}. ${v}`).join("\n"),
    );
  }

  return {
    pass: true,
    detail: "Config preflight passed",
    configResult,
    lifecycleResult,
  };
}
