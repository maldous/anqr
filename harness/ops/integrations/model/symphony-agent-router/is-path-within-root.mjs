// Generated from ../../../../scripts/ops/integrations/model/symphony-agent-router.mjs:33

import path from "node:path";

export function isPathWithinRoot(candidatePath, rootPath) {
  if (!candidatePath || !rootPath) return false;
  const relative = path.relative(rootPath, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
