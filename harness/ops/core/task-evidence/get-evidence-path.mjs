import path from "node:path";
import { getEvidenceDir } from "./get-evidence-dir.mjs";

export function getEvidencePath(correlationId) {
  return path.join(getEvidenceDir(), `${correlationId}.json`);
}
