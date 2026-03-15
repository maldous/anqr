import type { LogContext } from './logger-types';
import { sentryModuleState } from './sentry-module-state';

export function captureErrorEvent(
  scope: string,
  message: string,
  safeContext: LogContext | undefined,
  originalContext?: LogContext
): void {
  if (!sentryModuleState.module) return;

  sentryModuleState.module.withScope(
    (sentryScope: {
      setTag: (k: string, v: string) => void;
      setExtra: (k: string, v: unknown) => void;
      setExtras: (e: Record<string, unknown>) => void;
    }) => {
      sentryScope.setTag('logger.scope', scope);
      if (safeContext) {
        sentryScope.setExtras(safeContext);
      }

      const errorObj = originalContext?.error;
      if (errorObj instanceof Error) {
        sentryScope.setExtra('originalMessage', message);
        sentryModuleState.module.captureException(errorObj);
      } else {
        sentryModuleState.module.captureMessage(`[${scope}] ${message}`, 'error');
      }
    }
  );
}
