import { checkNpmScript } from "./check-npm-script.mjs";

export function checkTypecheck() {
  return checkNpmScript("typecheck", "tsc --noEmit");
}
