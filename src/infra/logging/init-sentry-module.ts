import { sentryModuleState } from './sentry-module-state';

export function initSentryModule(): void {
  if (typeof document === 'undefined') return;
  void import('@sentry/react').then((m) => {
    sentryModuleState.module = m;
  });
}
