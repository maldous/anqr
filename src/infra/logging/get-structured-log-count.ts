import { loggerState } from './logger-state';

export function getStructuredLogCount(): number {
  return loggerState.structuredLogBuffer.length;
}
