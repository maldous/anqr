export function computeRecencyBonus(updatedAt) {
  if (!updatedAt) return 0;
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0;
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  if (ageDays <= 7) return 0.08;
  if (ageDays <= 30) return 0.04;
  return 0;
}
