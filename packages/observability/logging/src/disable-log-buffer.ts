import { loggerState } from "./logger-state";

export function disableLogBuffer(): void {
  loggerState.logBufferEnabled = false;
}
