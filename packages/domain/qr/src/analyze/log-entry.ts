export interface LogEntry {
  timestamp: number;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}
