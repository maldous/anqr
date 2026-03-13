import type { LogContext } from './logger-types';

const isMainThread = typeof document !== 'undefined';

// biome-ignore lint/suspicious/noExplicitAny: Sentry module shape varies across versions
let SentryModule: any = null;

if (isMainThread) {
  void import('@sentry/react').then((m) => {
    SentryModule = m;
  });
}

export function captureWarningBreadcrumb(
  scope: string,
  message: string,
  safeContext?: LogContext
): void {
  if (!SentryModule) return;
  SentryModule.addBreadcrumb({
    category: scope,
    message,
    level: 'warning',
    data: safeContext as Record<string, unknown> | undefined,
  });
}

export function captureErrorEvent(
  scope: string,
  message: string,
  safeContext: LogContext | undefined,
  originalContext?: LogContext
): void {
  if (!SentryModule) return;

  SentryModule.withScope(
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
        SentryModule.captureException(errorObj);
      } else {
        SentryModule.captureMessage(`[${scope}] ${message}`, 'error');
      }
    }
  );
}
