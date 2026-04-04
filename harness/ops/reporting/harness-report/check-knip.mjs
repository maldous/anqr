import { checkNpmScript } from "./check-npm-script.mjs";

export function checkKnip() {
  return checkNpmScript("knip", "knip");
}
