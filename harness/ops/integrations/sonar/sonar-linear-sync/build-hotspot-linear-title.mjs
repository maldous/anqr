// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:366

import { stripProjectPrefix } from "./strip-project-prefix.mjs";

export function buildHotspotLinearTitle(hotspot, projectKey) {
  const filePath = stripProjectPrefix(hotspot.component, projectKey);
  const fileName = filePath.split("/").pop();
  const line = hotspot.textRange?.startLine || "?";
  const location = `(${fileName}:${line})`;
  const maxMsgLen = 200 - "[SonarHotspot] ".length - location.length - 1;
  const msg = hotspot.message;
  const truncatedMsg = msg.length > maxMsgLen ? msg.slice(0, maxMsgLen - 1) + "\u2026" : msg;
  return `[SonarHotspot] ${truncatedMsg} ${location}`;
}
