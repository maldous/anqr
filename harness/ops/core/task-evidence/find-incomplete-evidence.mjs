import fs from "node:fs";
import { getEvidenceDir } from "./get-evidence-dir.mjs";
import { validateEvidenceCompleteness } from "./validate-evidence-completeness.mjs";

/**
 * Scan the evidence directory for records missing mandatory fields.
 *
 * Returns an array of incomplete records with their missing fields.
 * Useful for auditing closure readiness and finding orphaned evidence.
 *
 * @param {"minimal"|"standard"|"full"|"enriched"} requiredLevel
 * @returns {Array<{ correlationId: string, missing: string[], status: string }>}
 */
export function findIncompleteEvidence(requiredLevel = "standard") {
  let dir;
  try {
    dir = getEvidenceDir();
  } catch {
    return [];
  }

  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }

  const incomplete = [];
  for (const file of files) {
    const correlationId = file.replace(/\.json$/, "");
    const result = validateEvidenceCompleteness(correlationId, requiredLevel);
    if (!result.complete) {
      incomplete.push({
        correlationId,
        missing: result.missing,
        status: result.status,
      });
    }
  }

  return incomplete;
}
