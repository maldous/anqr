import { runTests } from "../../../symphony-validation.mjs";

export function toolRunTests(projectRoot) {
  const result = runTests(projectRoot);
  return result.pass ? "Unit tests passed." : result.detail;
}
