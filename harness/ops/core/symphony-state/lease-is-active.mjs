// Generated from ../../../scripts/ops/core/symphony-state.mjs:259

export function leaseIsActive(record, now = Date.now()) {
  const lease = record?.lease;
  if (!lease?.expires_at) return false;
  return new Date(lease.expires_at).getTime() > now;
}
