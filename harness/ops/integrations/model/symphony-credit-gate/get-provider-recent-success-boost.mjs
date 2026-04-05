export function getProviderRecentSuccessBoost(stats, providerName) {
  const lastSuccess = stats.lastSuccess?.[providerName] || stats.lastSelected?.[providerName] || 0;
  if (!lastSuccess) return 0;
  const ageDays = Math.max(0, (Date.now() - lastSuccess) / (1000 * 60 * 60 * 24));
  const halfLifeDays = 7;
  const decay = Math.exp((-Math.LN2 * ageDays) / halfLifeDays);
  return Math.round(decay * 0.06 * 1000) / 1000;
}
