export function toInputBudget(contextLength) {
  if (!contextLength || contextLength < 4096) return null;
  return Math.max(4000, Math.floor(contextLength * 0.6));
}
