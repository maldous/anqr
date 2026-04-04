export function leaseIsActive(record, now = Date.now()) {
  const lease = record?.lease;
  if (!lease?.expires_at) return false;
  return new Date(lease.expires_at).getTime() > now;
}
