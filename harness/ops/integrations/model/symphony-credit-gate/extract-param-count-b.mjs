/**
 * Extract approximate parameter count from model name.
 * Matches patterns like "8b", "70b", "0.5b", "3.1-8b", "-14b-", etc.
 * Returns null if no parameter indicator is found.
 */
export function extractParamCountB(model) {
  // Match parameter size indicators like "8b", "70b", "0.5b", "3b", "14b"
  const match = model.match(/(?:^|[-._/:])(\d+(?:\.\d+)?)[bB](?:[-._/:]|$)/);
  if (!match) return null;
  return Number.parseFloat(match[1]);
}
