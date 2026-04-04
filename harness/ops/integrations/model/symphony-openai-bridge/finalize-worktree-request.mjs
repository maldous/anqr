// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1805

import { currentBranchName } from "./current-branch-name.mjs";
import { currentHeadSha } from "./current-head-sha.mjs";
import { hasTrackedChanges } from "./has-tracked-changes.mjs";
import { listDirtyFiles } from "./list-dirty-files.mjs";

export async function finalizeWorktreeRequest() {
  return {
    changed: hasTrackedChanges(),
    dirtyFiles: listDirtyFiles(),
    branch: currentBranchName(),
    head: currentHeadSha(),
    autoPromoted: false,
  };
}
