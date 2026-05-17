export function getRecommendation(isSystemic, commentCount, threshold) {
  if (isSystemic) return "FLAG_FOR_HUMAN_REVIEW";
  if (commentCount > threshold * 2) return "ARCHIVE_AND_CONSOLIDATE";
  return "ARCHIVE_ONLY";
}
