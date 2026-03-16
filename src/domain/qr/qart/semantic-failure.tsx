import type { RejectionReason, SemanticValidationResult } from "./validation";

export function semanticFailure(
  reason: RejectionReason,
  description: string,
  details?: SemanticValidationResult["details"],
): SemanticValidationResult {
  return {
    valid: false,
    reason,
    description,
    details,
  };
}
