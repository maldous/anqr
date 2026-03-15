import { loggerState } from './logger-state';

export function enableLogBuffer(): void {
  loggerState.logBufferEnabled = true;
  loggerState.logBuffer = [];
}
