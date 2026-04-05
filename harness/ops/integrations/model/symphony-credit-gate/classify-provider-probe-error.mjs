export function classifyProviderProbeError(message) {
  const normalized = String(message || '').toLowerCase();
  if (!normalized) return { status: 'provider_error', reason: 'empty error' };
  if (normalized.includes('not set') || normalized.includes('missing') || normalized.includes('no ')) {
    return { status: 'auth_missing', reason: 'missing credentials or configuration' };
  }
  if (normalized.includes('401') || normalized.includes('unauthorized') || normalized.includes('invalid api key') || normalized.includes('forbidden')) {
    return { status: 'auth_invalid', reason: 'credentials rejected' };
  }
  if (normalized.includes('402') || normalized.includes('quota') || normalized.includes('credits') || normalized.includes('payment required')) {
    return { status: 'quota_exhausted', reason: 'provider quota or credits exhausted' };
  }
  if (normalized.includes('429') || normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('weekly limit') || normalized.includes('session limit')) {
    return { status: 'rate_limited', reason: 'provider rate limit' };
  }
  if (normalized.includes('timeout') || normalized.includes('timed out') || normalized.includes('abort')) {
    return { status: 'timeout', reason: 'probe timed out' };
  }
  if (normalized.includes('enotfound') || normalized.includes('econnrefused') || normalized.includes('network') || normalized.includes('fetch failed')) {
    return { status: 'network_error', reason: 'network or DNS failure' };
  }
  return { status: 'provider_error', reason: 'provider probe failed' };
}
