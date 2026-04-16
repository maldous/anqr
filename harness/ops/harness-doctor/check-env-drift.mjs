import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

import { parseEnvKeys } from "./parse-env-keys.mjs";

/**
 * Check for drift between the repo env template and the live host env file.
 *
 * Reports:
 * - Missing keys: in template but not in live file
 * - Extra keys: in live file but not in template
 * - Symphony env symlink status
 *
 * Does NOT read secret values — only compares key names (not values — we never read secrets).
 */
export async function checkEnvDrift() {
  // Lazy-resolve paths so parseEnvKeys can be imported without triggering
  // the ROOT → dirname.mjs chain (which requires file:// import.meta.url).
  const { ROOT } = await import("./root.mjs");
  const REPO_TEMPLATE = resolve(ROOT, "services/systemd/anqr-ops.env");
  const LIVE_HOST_FILE = resolve(homedir(), ".config/systemd/user/anqr-ops.env");
  const SYMPHONY_ENV = resolve(homedir(), ".config/symphony/anqr.env");

  const issues = [];

  // Check template exists
  if (!existsSync(REPO_TEMPLATE)) {
    return {
      pass: false,
      detail: `Repo template missing: ${REPO_TEMPLATE}`,
      issues: ["repo_template_missing"],
    };
  }

  // Check live file exists
  if (!existsSync(LIVE_HOST_FILE)) {
    return {
      pass: false,
      detail: `Live env file missing: ${LIVE_HOST_FILE}`,
      issues: ["live_file_missing"],
    };
  }

  const templateKeys = new Set(parseEnvKeys(REPO_TEMPLATE));
  const liveKeys = new Set(parseEnvKeys(LIVE_HOST_FILE));

  // Keys in template but missing from live file
  const missingKeys = [...templateKeys].filter((k) => !liveKeys.has(k));
  if (missingKeys.length > 0) {
    issues.push(`Missing from live: ${missingKeys.join(", ")}`);
  }

  // Keys in live file but not in template (may indicate manual additions)
  const extraKeys = [...liveKeys].filter((k) => !templateKeys.has(k));
  if (extraKeys.length > 0) {
    issues.push(`Extra in live (not in template): ${extraKeys.join(", ")}`);
  }

  // Check symphony env symlink exists
  if (!existsSync(SYMPHONY_ENV)) {
    issues.push(`Symphony env missing: ${SYMPHONY_ENV}`);
  }

  const pass = issues.length === 0;
  return {
    pass,
    detail: pass
      ? `Env keys aligned (${templateKeys.size} keys, symphony env present)`
      : issues.join("; "),
    issues,
    templateKeyCount: templateKeys.size,
    liveKeyCount: liveKeys.size,
    missingKeys,
    extraKeys,
  };
}
