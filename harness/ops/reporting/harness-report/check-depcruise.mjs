import { checkNpmScript } from "./check-npm-script.mjs";

export function checkDepcruise() {
  return checkNpmScript("depcruise", "dependency-cruiser");
}
