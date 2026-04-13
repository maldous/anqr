import fs from "node:fs";
import path from "node:path";

export function getEvidenceDir() {
  const base =
    process.env.ANQR_EVIDENCE_DIR ||
    path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-task-evidence");
  fs.mkdirSync(base, { recursive: true });
  return base;
}
