import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

import { logDebug, logError, logWarn } from "./logger.mjs";

const FILE_NAME = "provider-probe-cache.json";

// Minimum number of available providers required to treat a probe result as
// trustworthy. A probe returning fewer than this is almost certainly the result
// of a network outage, a broken probe caller, or a health-state cascade — not a
// real reflection of provider availability. Saving it would poison all bridges
// for the next 35 minutes.
const MIN_HEALTHY_PROVIDERS = 10;

export function saveProbeCache(cache) {
  const available = cache.probeResults?.filter((r) => r.available).length ?? 0;
  const total = cache.probeResults?.length ?? 0;

  if (available < MIN_HEALTHY_PROVIDERS) {
    logWarn(
      `⚠️ Probe cache save REJECTED — only ${available}/${total} providers available ` +
      `(minimum ${MIN_HEALTHY_PROVIDERS}). Keeping previous cache to prevent poisoning. ` +
      `This usually means a network outage, broken probe timeout, or health-state cascade.`,
    );
    return;
  }

  try {
    saveBridgeFile(FILE_NAME, cache, { withLock: true });
    logDebug(`Saved probe cache (${available}/${total} available)`);
  } catch (err) {
    logError(`Failed to save probe cache: ${err.message}`);
  }
}
