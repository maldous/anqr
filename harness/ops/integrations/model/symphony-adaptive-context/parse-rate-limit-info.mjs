// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:335

import { extractErrorString } from "./extract-error-string.mjs";
import { getHeaderValue } from "./get-header-value.mjs";
import { getResponseHeaders } from "./get-response-headers.mjs";
import { parseHeaderInt } from "./parse-header-int.mjs";
import { parseResetHeader } from "./parse-reset-header.mjs";

export function parseRateLimitInfo(err) {
  const info = {
    retryAfterMs: null,
    rpmLimit: null,
    rpmRemaining: null,
    rpmResetAt: null,
    tpmLimit: null,
    tpmRemaining: null,
    tpmResetAt: null,
  };

  const headers = getResponseHeaders(err);
  if (headers) {
    const retryAfter = getHeaderValue(headers, "retry-after");
    if (retryAfter) {
      const seconds = Number.parseFloat(retryAfter);
      if (!Number.isNaN(seconds)) info.retryAfterMs = Math.ceil(seconds * 1_000);
    }
    info.rpmLimit = parseHeaderInt(headers, "x-ratelimit-limit-requests");
    info.rpmRemaining = parseHeaderInt(headers, "x-ratelimit-remaining-requests");
    info.tpmLimit = parseHeaderInt(headers, "x-ratelimit-limit-tokens");
    info.tpmRemaining = parseHeaderInt(headers, "x-ratelimit-remaining-tokens");
    info.rpmResetAt = parseResetHeader(headers, "x-ratelimit-reset-requests");
    info.tpmResetAt = parseResetHeader(headers, "x-ratelimit-reset-tokens");
  }

  const errStr = extractErrorString(err);
  const tpmLimitMatch = errStr.match(/tokens per minute.*?limit\s+(\d+)/i);
  if (tpmLimitMatch && !info.tpmLimit) {
    info.tpmLimit = Number.parseInt(tpmLimitMatch[1], 10);
  }

  const retryMatch = errStr.match(/retry[.-]after[:\s]+(\d+)/i);
  if (retryMatch && !info.retryAfterMs) {
    info.retryAfterMs = Number.parseInt(retryMatch[1], 10) * 1_000;
  }

  return info;
}
