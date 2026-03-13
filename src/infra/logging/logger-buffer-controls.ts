import { loggerState } from './logger-state';

export function enableLogBuffer(): void {
  loggerState.logBufferEnabled = true;
  loggerState.logBuffer = [];
}

export function disableLogBuffer(): void {
  loggerState.logBufferEnabled = false;
}

export function flushLogBuffer(): string {
  const result = loggerState.logBuffer.join('\n');
  loggerState.logBuffer = [];
  return result;
}

export function getBufferSize(): number {
  return loggerState.logBuffer.length;
}
