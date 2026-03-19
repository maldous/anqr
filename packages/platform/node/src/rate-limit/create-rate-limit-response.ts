export function createRateLimitResponse(retryAfterSeconds: number): Response {
  return new Response("Too Many Requests", {
    status: 429,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "retry-after": String(retryAfterSeconds),
    },
  });
}
