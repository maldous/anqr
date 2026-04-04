// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1150

import { logInfo, logWarn, logError } from "./logger.mjs";
export async function webSearchTool({ query, depth = "standard" }) {
  try {
    logInfo(`🌐 Web search: ${query.slice(0, 100)} (${depth})`);

    // Check for Linkup API key or other web search API
    const apiKey = process.env.LINKUP_API_KEY || process.env.WEB_SEARCH_API_KEY;

    if (!apiKey) {
      return {
        error: "Web search requires LINKUP_API_KEY or WEB_SEARCH_API_KEY environment variable",
        results: [],
        message: "Web search is not configured. Set LINKUP_API_KEY to enable this feature.",
      };
    }

    // Call Linkup API or similar web search service
    const response = await fetch("https://api.linkup.so/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        depth,
        outputType: "searchResults",
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      logError(`Web search API returned ${response.status}`);
      throw new Error(`Web search API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results || [],
      count: data.results?.length || 0,
      query,
    };
  } catch (error) {
    logWarn(`Web search failed: ${error.message}`);
    return {
      error: error.message,
      results: [],
      message: "Web search is currently unavailable",
    };
  }
}
