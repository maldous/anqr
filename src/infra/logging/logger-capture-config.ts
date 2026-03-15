import type { RuntimeLogLevel } from './logger-types';

const captureMinLevelRaw =
  typeof process === 'undefined'
    ? undefined
    : process.env.ANQR_LOG_CAPTURE_MIN_LEVEL?.toLowerCase();

export const captureMinLevel = (() => {
  switch (captureMinLevelRaw) {
    case 'trace':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
      return captureMinLevelRaw as RuntimeLogLevel;
    default:
      return 'warn' as RuntimeLogLevel;
  }
})();

export const captureWhenConsoleEnabled =
  typeof process !== 'undefined' && process?.env?.ANQR_LOG_CAPTURE_CONSOLE === '1';

export const forceStructuredCaptureAll =
  typeof process !== 'undefined' && process?.env?.ANQR_LOG_CAPTURE_ALL === '1';
