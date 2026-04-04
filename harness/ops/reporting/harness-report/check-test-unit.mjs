import { checkNpmScript } from "./check-npm-script.mjs";

export function checkTestUnit() {
  // Not included in any profile — unit tests run via Make's test-unit-coverage target.
  // Kept for standalone/programmatic use: node harness-report.mjs with a custom profile.
  return checkNpmScript("test:unit", "vitest", 300_000);
}
