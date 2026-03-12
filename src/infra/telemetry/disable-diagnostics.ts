import { resetLogLevel } from '../logging/logger';
import { log, readState, writeState } from './logger-remote._internal';

/**
 * Disable diagnostics mode and revert to default log level.
 */
export function disableDiagnostics(): void {
  const state = readState();
  writeState(null);
  resetLogLevel();

  log.info('Diagnostics disabled', {
    wasEnabled: !!state?.enabled,
    reason: state?.reason || 'unknown',
    duration: state ? Math.round((Date.now() - state.enabledAt) / 1000) : 0,
  });
}
