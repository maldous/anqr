import type { LogContext } from "./log-context.types";

export const noop = (_message: string, _context?: LogContext): void => {};
