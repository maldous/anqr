// Generated from ../../../../scripts/ops/runtime/mcp/context7-server.mjs:230

import { CLOUD_API_BASE } from "./cloud-api-base.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { logWarn, logError } from "./logger.mjs";

export async function getLibraryDocsCloud(libraryId, topic, _maxTokens = 5000) {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    logWarn("CONTEXT7_API_KEY not set — cloud fallback unavailable");
    return null;
  }

  try {
    const body = { libraryId };
    if (topic) body.query = topic;

    const response = await fetch(`${CLOUD_API_BASE}/docs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      logWarn(`Cloud get-library-docs failed: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Context7 returns an array of result objects with snippets
    if (data?.results && Array.isArray(data.results)) {
      const docs = data.results
        .map((r) => {
          const parts = [];
          if (r.title) parts.push(`## ${r.title}`);
          if (r.description) parts.push(r.description);
          if (r.codeExample) parts.push(`\`\`\`\n${r.codeExample}\n\`\`\``);
          if (r.snippet) parts.push(r.snippet);
          if (r.sourceUrl) parts.push(`Source: ${r.sourceUrl}`);
          return parts.join("\n\n");
        })
        .join("\n\n---\n\n");
      return docs || null;
    }
    return data?.documentation || data?.content || JSON.stringify(data);
  } catch (err) {
    logError(`Cloud get-library-docs error: ${err.message}`);
    return null;
  }
}
