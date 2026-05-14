import { execFileSync } from "node:child_process";
import { runGlobalPreflights, validationManifestHash } from "../../symphony-validation.mjs";
import { setGlobalValue, getGlobalValue } from "../../symphony-state.mjs";

import { ROOT } from "./root.mjs";
import { logInfo, logWarn } from "./logger.mjs";

/** Config preflight cache interval — re-check every hour (config can drift without code changes). */
const CONFIG_PREFLIGHT_INTERVAL_MS = 60 * 60 * 1000;

export async function maybeRunPreflights() {
  // 1. Baseline code preflights (git-HEAD + manifest-hash cached)
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf-8" }).trim();
  const manifestHash = validationManifestHash();
  const cachedHead = getGlobalValue("baseline.head");
  const cachedHash = getGlobalValue("baseline.manifestHash");
  const cachedPass = getGlobalValue("baseline.pass");
  let baselineResult;
  if (cachedHead === head && cachedHash === manifestHash && cachedPass === true) {
    logInfo("[runner] Baseline cache hit — skipping full pre-flights");
    baselineResult = { pass: true, cached: true };
  } else {
    baselineResult = await runGlobalPreflights(ROOT);
    setGlobalValue("baseline.head", head);
    setGlobalValue("baseline.manifestHash", manifestHash);
    setGlobalValue("baseline.pass", Boolean(baselineResult.pass));
    setGlobalValue("baseline.checkedAt", new Date().toISOString());
  }

  if (!baselineResult.pass) return baselineResult;

  // 2. Config preflight — time-based cache (config can drift without code changes)
  const lastConfigCheck = getGlobalValue("configPreflight.checkedAt");
  const configCacheValid =
    lastConfigCheck &&
    Date.now() - new Date(lastConfigCheck).getTime() < CONFIG_PREFLIGHT_INTERVAL_MS;

  if (configCacheValid && getGlobalValue("configPreflight.pass") === true) {
    logInfo("[runner] Config preflight cache hit — skipping");
    return baselineResult;
  }

  try {
    const { enforceConfigPreflight } = await import("../../harness-doctor.mjs");
    await enforceConfigPreflight();
    setGlobalValue("configPreflight.pass", true);
    setGlobalValue("configPreflight.checkedAt", new Date().toISOString());
    logInfo("[runner] ✅ Config preflight passed");
  } catch (err) {
    logWarn(`[runner] Config preflight failed: ${err.message}`);
    setGlobalValue("configPreflight.pass", false);
    setGlobalValue("configPreflight.checkedAt", new Date().toISOString());
    return { pass: false, check: "config-preflight", detail: err.message };
  }

  return baselineResult;
}
