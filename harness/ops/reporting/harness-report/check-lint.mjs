import { checkNpmScript } from "./check-npm-script.mjs";

export function checkLint() {
  return checkNpmScript("lint", "oxlint");
}
