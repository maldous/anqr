import { resetLogLevel } from '../logging/logger';
import { log } from './log';
import { readState } from './read-state';
import { writeState } from './write-state';

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
