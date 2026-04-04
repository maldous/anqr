// Generated from ../../../../scripts/ops/runtime/mcp/context7-server.mjs:192

import { CLOUD_API_BASE } from "./cloud-api-base.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { logWarn, logError } from "./logger.mjs";

export async function resolveLibraryIdCloud(libraryTitle) {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  try {
    const response = await fetch(`${CLOUD_API_BASE}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query: libraryTitle }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      logWarn(`Cloud resolve-library-id failed: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data?.id || data?.libraryId || data?.context7CompatibleLibraryID || null;
  } catch (err) {
    logError(`Cloud resolve-library-id error: ${err.message}`);
    return null;
  }
}
