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
