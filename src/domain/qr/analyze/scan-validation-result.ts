export interface ValidationResult {
  valid: boolean;
  data?: string;
  error?: string;
  confidence: 'high' | 'medium' | 'low';
}
