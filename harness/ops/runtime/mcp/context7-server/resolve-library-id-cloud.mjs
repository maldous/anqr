import { CLOUD_API_BASE } from "./cloud-api-base.mjs";
import { fetchCloud } from "./fetch-cloud.mjs";
import { extractLibraryId } from "./extract-library-id.mjs";
import { logWarn, logError } from "./logger.mjs";

export async function resolveLibraryIdCloud(libraryTitle, topic) {
  const normalizedTitle = String(libraryTitle || "").trim();
  if (!normalizedTitle) return null;
  if (normalizedTitle.startsWith("/")) {
    return normalizedTitle;
  }

  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  try {
    const url = new URL(`${CLOUD_API_BASE}/api/v2/libs/search`);
    url.searchParams.set("libraryName", normalizedTitle);
    url.searchParams.set(
      "query",
      topic ? `Documentation for ${normalizedTitle} about ${topic}` : normalizedTitle,
    );

    const response = await fetchCloud(url, apiKey);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logWarn(
        `Cloud resolve-library-id failed: HTTP ${response.status}${body ? ` — ${body}` : ""}`,
      );
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data?.results) && data.results.length > 0) {
      return (
        data.results[0]?.id || extractLibraryId(data.results[0], { preferredText: normalizedTitle })
      );
    }

    return extractLibraryId(data, { preferredText: normalizedTitle });
  } catch (err) {
    logError(`Cloud resolve-library-id error: ${err.message}`);
    return null;
  }
}
