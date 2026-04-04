// Generated from ../../../../scripts/ops/integrations/linear/review-open-issues.mjs:71

import { ROOT } from "./root.mjs";
import { execAsync } from "./exec-async.mjs";

export async function fileExistsInGit(filepath) {
  try {
    await execAsync(`git ls-files --error-unmatched "${filepath}"`, { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}
