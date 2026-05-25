export function createRateLimitResponse(retryAfterSeconds: number): Response {
  return new Response("Too Many Requests", {
    status: 429,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "retry-after": String(retryAfterSeconds),
      // ADR-0016: the rate limit is in-memory per Netlify container,
      // not a hard cross-container ceiling. SDK clients and dashboards
      // can read this header to adjust their backoff strategy.
      "x-anqr-ratelimit-mode": "approximate",
    },
  });
}
