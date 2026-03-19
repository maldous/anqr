import type { Logger } from "./logger.types";
import { NOOP_LOGGER } from "./noop-logger.const";

export function createLogger(_scope: string): Logger {
  return NOOP_LOGGER;
}
