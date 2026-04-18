import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function readDocsTool({ libraryTitle, topic, max_tokens = 20000 }) {
  async function tryLocalContext7({
    libraryTitle: localLibraryTitle,
    topic: localTopic,
    maxTokens,
  }) {
    const response = await fetch(`${CONTEXT7_HTTP_BASE}/v1/resolve-docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        libraryTitle: localLibraryTitle,
        topic: localTopic,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(35000),
    });

    if (!response.ok) {
      const retryable = response.status >= 500 || response.status === 429;
      return {
        ok: false,
        retryable,
        status: response.status,
        reason: `Context7 HTTP service returned ${response.status}`,
      };
    }

    const result = await response.json();
    if (result.documentation) {
      return {
        ok: true,
        result: {
          content: result.documentation,
          library: localLibraryTitle,
          topic: localTopic,
          source: result.source || "local-http",
          tokens: Math.ceil(result.documentation.length / 4),
        },
      };
    }

    return {
      ok: false,
      retryable: false,
      status: 200,
      reason: result.error || "Context7 HTTP service returned no documentation",
    };
  }

  try {
    logInfo(`📚 Reading docs: ${libraryTitle} - ${topic}`);

    const effectiveMaxTokens = Math.max(max_tokens, 10000);

    try {
      const local = await tryLocalContext7({
        libraryTitle,
        topic,
        maxTokens: effectiveMaxTokens,
      });
      if (local.ok && local.result) {
        logInfo(`📚 Docs resolved via ${local.result.source} for "${libraryTitle}"`);
        return local.result;
      }
      if (local.ok) {
        logWarn(
          `Context7 HTTP service reported success without documentation for "${libraryTitle}"`,
        );
      }
      if (!local.retryable) {
        logInfo(
          `ℹ️ Local Context7 returned no local result for "${libraryTitle}" (${local.reason})`,
        );
      } else {
        logWarn(`Context7 HTTP service retryable failure: ${local.reason}`);
      }
    } catch (err) {
      logWarn(
        `⚠️ Context7 HTTP service not reachable — falling back to cloud docs (${err.message})`,
      );
    }

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
