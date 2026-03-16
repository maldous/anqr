import type { RuntimeLogLevel } from "./logger-types";

export const LOG_LEVEL_INDEX: Record<RuntimeLogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};
