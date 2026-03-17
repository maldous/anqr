export interface StructuredLogEntry {
  timestamp: string;
  scope: string;
  level: string;
  message: string;
  context?: unknown;
}
