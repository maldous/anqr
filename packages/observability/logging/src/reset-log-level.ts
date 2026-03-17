import { defaultLevel } from "./logger-config";
import { setLogLevel } from "./set-log-level";
import type { LogLevel } from "./logger-types";

export function resetLogLevel(): void {
  setLogLevel(defaultLevel as LogLevel);
}
