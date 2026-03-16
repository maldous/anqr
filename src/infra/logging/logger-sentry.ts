import type { LogContext } from './logger-types';
import { initSentryModule } from './init-sentry-module';
import { sentryModuleState } from './sentry-module-state';

initSentryModule();

export function captureWarningBreadcrumb(
  scope: string,
  message: string,
  safeContext?: LogContext
): void {
  const sentry = sentryModuleState.module;
  if (!sentry) return;
  sentry.addBreadcrumb({
    category: scope,
    message,
    level: 'warning',
    data: safeContext as Record<string, unknown> | undefined,
  });
}

export { captureErrorEvent } from './capture-error-event';
