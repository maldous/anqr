import { captureToBuffer } from './logger-buffer-api';
import {
  getLoglevelInstance,
  isLevelEnabledForLogger,
  shouldCaptureStructured,
} from './logger-config';
import { sanitizeLogContext } from './logger-redaction';
import { captureErrorEvent, captureWarningBreadcrumb } from './logger-sentry';
import { loggerState } from './logger-state';
import type { LogContext, Logger, RuntimeLogLevel } from './logger-types';

const loglevel = getLoglevelInstance();

export function createLogger(scope: string): Logger {
  const upperScope = scope.toUpperCase();
  const logger = loglevel.getLogger(upperScope);

  logger.setLevel(loglevel.getLevel());

  const emit = (
    level: Exclude<RuntimeLogLevel, 'silent'>,
    message: string,
    context?: LogContext
  ): LogContext | undefined => {
    const consoleEnabled = isLevelEnabledForLogger(logger, level);
    const captureStructured = shouldCaptureStructured(level, consoleEnabled);
    const captureString = loggerState.logBufferEnabled;
    const needsSanitizedContext =
      !!context && (captureStructured || captureString || level === 'warn' || level === 'error');
    const safeContext = needsSanitizedContext ? sanitizeLogContext(context) : undefined;
    const contextForConsole = safeContext ?? context;

    if (captureStructured || captureString) {
      captureToBuffer(upperScope, level, message, safeContext ?? contextForConsole, {
        captureStructured,
        captureString,
      });
    }

    if (consoleEnabled) {
      const method = logger[level].bind(logger) as (msg: string, ctx?: LogContext) => void;
      if (contextForConsole) {
        method(message, contextForConsole);
      } else {
        method(message);
      }
    }

    return safeContext;
  };

  return {
    trace(message: string, context?: LogContext): void {
      emit('trace', message, context);
    },
    debug(message: string, context?: LogContext): void {
      emit('debug', message, context);
    },
    info(message: string, context?: LogContext): void {
      emit('info', message, context);
    },
    warn(message: string, context?: LogContext): void {
      const safeContext = emit('warn', message, context);
      captureWarningBreadcrumb(upperScope, message, safeContext);
    },
    error(message: string, context?: LogContext): void {
      const safeContext = emit('error', message, context);
      captureErrorEvent(upperScope, message, safeContext, context);
    },
  };
}
