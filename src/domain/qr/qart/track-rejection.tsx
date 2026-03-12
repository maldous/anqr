import type { BinarySearchValidationResult } from './binary-search-validation-result';
import type { RejectionHistogram } from './scan-fallback.types';

export function trackRejection(
  rejectionHistogram: RejectionHistogram,
  isValid: boolean,
  validation: BinarySearchValidationResult
): void {
  rejectionHistogram.total++;
  if (isValid) {
    rejectionHistogram.ACCEPTED++;
    return;
  }
  if (validation.reason) {
    const reason = validation.reason as keyof RejectionHistogram;
    if (reason in rejectionHistogram && reason !== 'ACCEPTED' && reason !== 'total') {
      rejectionHistogram[reason]++;
    }
  }
}
