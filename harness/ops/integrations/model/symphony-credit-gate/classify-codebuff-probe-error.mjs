import { isPaymentRequiredError } from '../codebuff-direct/is-payment-required-error.mjs';
import { isRateLimitError } from '../codebuff-direct/is-rate-limit-error.mjs';

export function classifyCodebuffProbeError(error) {
  const message = error?.message || String(error || 'unknown error');
  const normalized = message.toLowerCase();
  if (isPaymentRequiredError(normalized)) {
    return { status: 'quota_exhausted', reason: 'paid mode exhausted credits', message };
  }
  if (isRateLimitError(normalized)) {
    return { status: 'rate_limited', reason: 'provider rate limit or session limit', message };
  }
  if (normalized.includes('timed out') || normalized.includes('timeout')) {
    return { status: 'timeout', reason: 'probe timed out', message };
  }
  if (normalized.includes('not set')) {
    return { status: 'auth_missing', reason: 'CODEBUFF_API_KEY is not set', message };
  }
  return { status: 'provider_error', reason: 'codebuff probe failed', message };
}
