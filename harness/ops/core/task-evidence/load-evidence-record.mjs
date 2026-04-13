import fs from "node:fs";
import { getEvidencePath } from "./get-evidence-path.mjs";

export function loadEvidenceRecord(correlationId) {
  try {
    return JSON.parse(fs.readFileSync(getEvidencePath(correlationId), "utf-8"));
  } catch {
    return null;
  }
}
