import { loggerState } from "./logger-state";

export function getBufferSize(): number {
  return loggerState.logBuffer.length;
}
