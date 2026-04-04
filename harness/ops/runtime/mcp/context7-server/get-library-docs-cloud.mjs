import { CLOUD_API_BASE } from "./cloud-api-base.mjs";
import { fetchCloud } from "./fetch-cloud.mjs";
import { formatCloudContext } from "./format-cloud-context.mjs";
import { getLibraryDocsLegacyCloud } from "./get-library-docs-legacy-cloud.mjs";
import { logWarn, logError } from "./logger.mjs";

export async function getLibraryDocsCloud(libraryId, topic, maxTokens = 5000, libraryTitle = "") {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  const normalizedId = String(libraryId || "").trim();
  if (!normalizedId) {
    return null;
  }

  try {
    const url = new URL(`${CLOUD_API_BASE}/api/v2/context`);
    url.searchParams.set("libraryId", normalizedId);
    url.searchParams.set(
      "query",
      topic || `Documentation and examples for ${libraryTitle || normalizedId}`,
    );
    url.searchParams.set("type", "json");

    let response = await fetchCloud(url, apiKey);

    if (response.status === 301) {
      const redirectUrl = response.headers.get("location");
      if (redirectUrl) {
        response = await fetchCloud(redirectUrl, apiKey);
      }
    }

    if (response.ok) {
      const data = await response.json();
      const documentation = formatCloudContext(data);
      if (documentation) {
        return documentation;
      }
    } else {
      const body = await response.text().catch(() => "");
      logWarn(`Cloud get-library-docs failed: HTTP ${response.status}${body ? ` — ${body}` : ""}`);
    }
  } catch (err) {
    logError(`Cloud get-library-docs error: ${err.message}`);
  }

  const legacyLibrary = normalizedId.startsWith("/") ? normalizedId : libraryTitle || normalizedId;
  return getLibraryDocsLegacyCloud(apiKey, legacyLibrary, topic, maxTokens);
}
