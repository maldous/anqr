export function formatValidationStatus(value) {
  if (value === true) return "passed";
  if (value === false) return "failed";
  return "skipped or not recorded";
}
