import type { FormatVerificationResult } from './validation';
import type { BinarySearchValidationResult } from './binary-search-validation-result';

export interface CandidateValidation {
  isValid: boolean;
  validation: BinarySearchValidationResult;
  formatVerification?: FormatVerificationResult;
}
