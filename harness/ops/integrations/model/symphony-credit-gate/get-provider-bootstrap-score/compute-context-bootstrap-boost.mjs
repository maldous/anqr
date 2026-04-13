// Log-scaled context-length boost for bootstrap scores
export function computeContextBootstrapBoost(contextLength) {
  if (!contextLength || contextLength <= 0) return 0;
  const logVal = Math.log2(contextLength / 1024);
  return Math.min(0.05, Math.max(0, (logVal - 1) / 180)); // up to +0.05 for 1M+ context
}
