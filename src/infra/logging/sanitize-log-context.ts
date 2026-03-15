import type { LogContext } from './logger-types';
import { redactSensitive } from './logger-redaction';

export function sanitizeLogContext(context?: LogContext): LogContext | undefined {
  return context ? (redactSensitive(context) as LogContext) : undefined;
}
