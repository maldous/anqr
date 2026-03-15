export interface DiagnosticsState {
  enabled: boolean;
  expiresAt: number; // Unix timestamp in milliseconds
  reason: string;
  enabledAt: number; // Unix timestamp when enabled
}
