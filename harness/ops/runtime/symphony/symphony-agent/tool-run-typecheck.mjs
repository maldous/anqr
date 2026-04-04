import { runTypecheck } from "../../../symphony-validation.mjs";

export function toolRunTypecheck(projectRoot) {
  const result = runTypecheck(projectRoot);
  return result.pass ? "Typecheck passed — no errors." : result.detail;
}
