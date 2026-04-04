import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function readDocsTool({ libraryTitle, topic, max_tokens = 20000 }) {
  try {
    logInfo(`📚 Reading docs: ${libraryTitle} - ${topic}`);

    const effectiveMaxTokens = Math.max(max_tokens, 10000);

    // Attempt 1: Context7 HTTP service (dedicated systemd service on port 4320)
    try {
      const httpRes = await fetch(`${CONTEXT7_HTTP_BASE}/v1/resolve-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libraryTitle, topic, max_tokens: effectiveMaxTokens }),
        signal: AbortSignal.timeout(35000),
      });

      if (httpRes.ok) {
        const result = await httpRes.json();
        if (result.documentation) {
          logInfo(`📚 Docs resolved via ${result.source} for "${libraryTitle}"`);
          return {
            content: result.documentation,
            library: libraryTitle,
            topic,
            source: result.source,
            tokens: Math.ceil(result.documentation.length / 4),
          };
        }
      } else {
        logWarn(`Context7 HTTP service returned ${httpRes.status}`);
      }
    } catch (err) {
      logWarn(`Context7 HTTP service unavailable: ${err.message}`);
    }

    // Attempt 2: Direct Context7 cloud API (legacy fallback)
    const apiKey = process.env.CONTEXT7_API_KEY || process.env.DOCS_API_KEY;

    if (!apiKey) {
      return {
        error:
          "Documentation reading requires CONTEXT7_API_KEY or DOCS_API_KEY environment variable",
        content: "",
        message:
          "Documentation API is not configured. Set CONTEXT7_API_KEY to enable this feature.",
      };
    }

    const response = await fetch("https://api.context7.com/v1/docs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        library: libraryTitle,
        topic,
        max_tokens: effectiveMaxTokens,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      logError(`Context7 API returned ${response.status}`);
      throw new Error(`Context7 API returned ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content || "",
      library: libraryTitle,
      topic,
      source: "cloud-direct",
      tokens: data.tokens || 0,
    };
  } catch (error) {
    logWarn(`Documentation reading failed: ${error.message}`);
    return {
      error: error.message,
      content: "",
      message: "Documentation API is currently unavailable",
    };
  }
}
