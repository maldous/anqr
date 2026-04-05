export function pruneProviderLeases(leases, now = Date.now()) {
  return (Array.isArray(leases) ? leases : []).filter(
    (lease) => Number(lease?.expiresAt || 0) > now,
  );
}
