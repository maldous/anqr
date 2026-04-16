import { loadEvidenceRecordWithDiagnostics } from "./load-evidence-record-with-diagnostics.mjs";
import {
  EVIDENCE_LEVELS,
  LEVEL_CHECKS,
  CONDITIONAL_CHECKS,
} from "./mandatory-evidence-fields.mjs";
import { checkField } from "./check-field.mjs";
import { shouldApplyConditional } from "./should-apply-conditional.mjs";

/**
 * Validate evidence completeness for a correlation ID.
 *
 * Checks mandatory fields at the requested level (cumulative) and
 * any applicable conditional checks. Returns a structured result
 * the closure gate uses to decide whether to proceed or defer.
 *
 * @param {string} correlationId
 * @param {"minimal"|"standard"|"full"|"enriched"} requiredLevel
 * @returns {{ complete: boolean, level: string, missing: string[], status: string, error?: string }}
 */
export function validateEvidenceCompleteness(correlationId, requiredLevel = "standard") {
  const diag = loadEvidenceRecordWithDiagnostics(correlationId);
  if (diag.status === "missing") {
    return { complete: false, level: "none", missing: ["record"], status: "missing" };
  }
  if (diag.status === "corrupted") {
    return {
      complete: false,
      level: "none",
      missing: ["record"],
      status: "corrupted",
      error: diag.error,
    };
  }

  const record = diag.record;
  const missing = [];
  let highestLevel = "none";

  const requiredIndex = EVIDENCE_LEVELS.indexOf(requiredLevel);
  if (requiredIndex === -1) {
    return { complete: false, level: "none", missing: ["invalid_level"], status: "error" };
  }

  for (let i = 0; i <= requiredIndex; i++) {
    const levelName = EVIDENCE_LEVELS[i];
    const checks = LEVEL_CHECKS[levelName];
    let levelClean = true;

    for (const check of checks) {
      if (!checkField(record, check)) {
        missing.push(check.path);
        levelClean = false;
      }
    }

    if (levelClean && missing.length === 0) {
      highestLevel = levelName;
    }
  }

  // Conditional checks apply at standard+
  if (requiredIndex >= 1) {
    for (const check of CONDITIONAL_CHECKS) {
      if (shouldApplyConditional(record, check.condition) && !checkField(record, check)) {
        missing.push(check.path);
      }
    }
  }

  return {
    complete: missing.length === 0,
    level: highestLevel,
    missing,
    status: "ok",
  };
}
