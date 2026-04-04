// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:187

import path from "node:path";

export function isPathWithinRoot(candidatePath, rootPath) {
  if (!candidatePath || !rootPath) return false;
  const relative = path.relative(rootPath, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
