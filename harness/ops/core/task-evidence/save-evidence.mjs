import fs from "node:fs";
import { getEvidencePath } from "./get-evidence-path.mjs";

export function saveEvidence(correlationId, record) {
  const filePath = getEvidencePath(correlationId);
  const tmpFile = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(record, null, 2) + "\n");
  fs.renameSync(tmpFile, filePath);
}
