import type { LogContext } from "./logger-types";
import { sentryModuleState } from "./sentry-module-state";

export function captureErrorEvent(
  scope: string,
  message: string,
  safeContext: LogContext | undefined,
  originalContext?: LogContext,
): void {
  const sentry = sentryModuleState.module;
  if (!sentry) return;

  sentry.withScope((sentryScope) => {
    sentryScope.setTag("logger.scope", scope);
    if (safeContext) {
      sentryScope.setExtras(safeContext);
    }

    const errorObj = originalContext?.error;
    if (errorObj instanceof Error) {
      sentryScope.setExtra("originalMessage", message);
      sentry.captureException(errorObj);
    } else {
      sentry.captureMessage(`[${scope}] ${message}`, "error");
    }
  });
}
