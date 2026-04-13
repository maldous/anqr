import { updateEvidenceRecord } from "./update-evidence-record.mjs";

export function recordValidationResult(correlationId, validation) {
  return updateEvidenceRecord(correlationId, {
    validation: {
      ranAt: new Date().toISOString(),
      passed: validation.passed,
      typecheckPassed: validation.typecheckPassed ?? null,
      testsPassed: validation.testsPassed ?? null,
      lintPassed: validation.lintPassed ?? null,
      errors: validation.errors || [],
    },
  });
}
