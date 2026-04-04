export function calculateValidationScore(errors, warnings) {
  const errorPenalty = errors.length * 20;
  const warningPenalty = warnings.length * 5;
  const maxScore = 100;

  const score = Math.max(0, maxScore - errorPenalty - warningPenalty);
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}
