export function formatPolyTermSign(coefficient: number, hasExistingTerms: boolean): string {
  if (coefficient < 0) return " - ";
  if (hasExistingTerms) return " + ";
  return "";
}
