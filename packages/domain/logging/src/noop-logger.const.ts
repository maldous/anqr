import type { Logger } from "./logger.types";
import { noop } from "./noop";

export const NOOP_LOGGER: Logger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};
