import { LEGACY_CLOUD_API_BASE } from "./cloud-api-base.mjs";
import { fetchCloud } from "./fetch-cloud.mjs";
import { formatCloudContext } from "./format-cloud-context.mjs";
import { logWarn, logError } from "./logger.mjs";

export async function getLibraryDocsLegacyCloud(apiKey, library, topic, maxTokens = 5000) {
  try {
    const response = await fetchCloud(`${LEGACY_CLOUD_API_BASE}/v1/docs`, apiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library,
        topic,
        max_tokens: Math.max(1000, Number(maxTokens) || 5000),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logWarn(
        `Legacy cloud docs request failed: HTTP ${response.status}${body ? ` — ${body}` : ""}`,
      );
      return null;
    }

    const data = await response.json();
    return formatCloudContext(data);
  } catch (err) {
    logError(`Legacy cloud docs error: ${err.message}`);
    return null;
  }
}
