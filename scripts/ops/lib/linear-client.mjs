/**
 * Resilient Linear GraphQL client with exponential backoff.
 *
 * Linear sometimes returns HTTP 400 for what are actually rate-limit (429)
 * responses. This client detects both cases and retries with backoff.
 *
 * Retry decision matrix:
 *   429                           → always retry
 *   400 + Retry-After header      → retry (disguised rate limit)
 *   400 + rate-limit keywords     → retry (disguised rate limit)
 *   400 + clean GraphQL error     → do NOT retry (genuine client error)
 *   500 / 502 / 503 / 504        → retry (transient server error)
 *   Network error (fetch throws)  → retry (DNS / ECONNRESET / timeout)
 *   200 + GraphQL errors array    → do NOT retry (business logic error)
 */

const RATE_LIMIT_PATTERN = /rate.?limit|too many requests|throttl|quota|capacity/i;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const DEFAULTS = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60_000,
};

function jitter(ms) {
  const factor = 0.75 + Math.random() * 0.5; // ±25%
  return Math.round(ms * factor);
}

function parseRetryAfter(header) {
  if (!header) return 0;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  const date = Date.parse(header);
  if (Number.isFinite(date)) {
    const delta = date - Date.now();
    return delta > 0 ? delta : 0;
  }
  return 0;
}

function isDisguisedRateLimit(status, headers, bodyText) {
  if (status === 400 && parseRetryAfter(headers.get('retry-after')) > 0) return true;
  if (status === 400 && RATE_LIMIT_PATTERN.test(bodyText)) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a resilient Linear GraphQL function.
 *
 * @param {string} apiKey  Linear API key (full header value)
 * @param {{ maxRetries?: number, baseDelayMs?: number, maxDelayMs?: number }} opts
 * @returns {(query: string, variables?: Record<string, unknown>) => Promise<unknown>}
 */
export function createGql(apiKey, opts = {}) {
  const maxRetries = opts.maxRetries ?? DEFAULTS.maxRetries;
  const baseDelayMs = opts.baseDelayMs ?? DEFAULTS.baseDelayMs;
  const maxDelayMs = opts.maxDelayMs ?? DEFAULTS.maxDelayMs;

  return async function gql(query, variables = {}) {
    if (!apiKey) {
      throw new Error('LINEAR_API_KEY is not set');
    }

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let res;
      let bodyText;

      try {
        res = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
          },
          body: JSON.stringify({ query, variables }),
        });
        bodyText = await res.text();
      } catch (networkError) {
        lastError = new Error(`Linear network error: ${networkError.message}`);
        if (attempt < maxRetries) {
          const delay = jitter(Math.min(baseDelayMs * 2 ** attempt, maxDelayMs));
          console.error(
            `[linear-client] Network error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms: ${networkError.message}`
          );
          await sleep(delay);
          continue;
        }
        throw lastError;
      }

      // Explicit 429 or retryable server error
      if (RETRYABLE_STATUSES.has(res.status)) {
        lastError = new Error(`Linear HTTP ${res.status}: ${bodyText.slice(0, 200)}`);
        if (attempt < maxRetries) {
          const retryAfterMs = parseRetryAfter(res.headers.get('retry-after'));
          const backoff = jitter(Math.min(baseDelayMs * 2 ** attempt, maxDelayMs));
          const delay = Math.max(backoff, retryAfterMs);
          console.error(
            `[linear-client] HTTP ${res.status} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`
          );
          await sleep(delay);
          continue;
        }
        throw lastError;
      }

      // 400 that is actually a disguised rate limit
      if (res.status === 400 && isDisguisedRateLimit(res.status, res.headers, bodyText)) {
        lastError = new Error(`Linear rate-limited (disguised 400): ${bodyText.slice(0, 200)}`);
        if (attempt < maxRetries) {
          const retryAfterMs = parseRetryAfter(res.headers.get('retry-after'));
          const backoff = jitter(Math.min(baseDelayMs * 2 ** attempt, maxDelayMs));
          const delay = Math.max(backoff, retryAfterMs);
          console.error(
            `[linear-client] Disguised rate limit (400) (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`
          );
          await sleep(delay);
          continue;
        }
        throw lastError;
      }

      // Any other non-2xx is a hard failure (genuine 400, 401, 403, 404, etc.)
      if (!res.ok) {
        throw new Error(`Linear HTTP ${res.status}: ${bodyText.slice(0, 500)}`);
      }

      // Parse JSON response
      let data;
      try {
        data = JSON.parse(bodyText);
      } catch {
        throw new Error(`Linear returned non-JSON: ${bodyText.slice(0, 200)}`);
      }

      // GraphQL-level errors are not retryable
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const msg = data.errors.map((e) => e.message).join('; ');
        throw new Error(`Linear GraphQL error: ${msg}`);
      }

      return data.data;
    }

    throw lastError || new Error('Linear request failed after retries');
  };
}
