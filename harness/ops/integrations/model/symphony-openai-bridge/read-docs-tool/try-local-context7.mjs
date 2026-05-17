import { CONTEXT7_HTTP_BASE } from "../context7-http-base.mjs";

export async function tryLocalContext7({
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
