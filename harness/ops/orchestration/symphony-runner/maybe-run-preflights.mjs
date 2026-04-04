import { execFileSync } from "node:child_process";
import { runGlobalPreflights, validationManifestHash } from "../../symphony-validation.mjs";
import { setGlobalValue, getGlobalValue } from "../../symphony-state.mjs";

import { ROOT } from "./root.mjs";
import { logInfo } from "./logger.mjs";

export async function maybeRunPreflights() {
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf-8" }).trim();
  const manifestHash = validationManifestHash();
  const cachedHead = getGlobalValue("baseline.head");
  const cachedHash = getGlobalValue("baseline.manifestHash");
  const cachedPass = getGlobalValue("baseline.pass");
  if (cachedHead === head && cachedHash === manifestHash && cachedPass === true) {
    logInfo("[runner] Baseline cache hit — skipping full pre-flights");
    return { pass: true, cached: true };
  }
  const result = runGlobalPreflights(ROOT);
  setGlobalValue("baseline.head", head);
  setGlobalValue("baseline.manifestHash", manifestHash);
  setGlobalValue("baseline.pass", Boolean(result.pass));
  setGlobalValue("baseline.checkedAt", new Date().toISOString());
  return result;
}
