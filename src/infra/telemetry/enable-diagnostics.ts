import { setLogLevel } from '../logging/logger';
import { log, DEFAULT_TTL_MINUTES, MAX_TTL_MINUTES, DiagnosticsState, writeState } from './logger-remote._internal';

// ============================================================================
// Public API
// ============================================================================

/**
 * Enable diagnostics mode for a specified duration.
 *
 * @param ttlMinutes - How long to enable diagnostics (default 60, max 120)
 * @param reason - Why diagnostics is being enabled (for audit log)
 */
export function enableDiagnostics(ttlMinutes = DEFAULT_TTL_MINUTES, reason = 'manual'): void {
  const ttl = Math.min(Math.max(1, ttlMinutes), MAX_TTL_MINUTES);
  const now = Date.now();

  const state: DiagnosticsState = {
    enabled: true,
    expiresAt: now + ttl * 60 * 1000,
    reason,
    enabledAt: now,
  };

  writeState(state);
  setLogLevel('debug');

  log.info('Diagnostics enabled', {
    ttlMinutes: ttl,
    reason,
    expiresAt: new Date(state.expiresAt).toISOString(),
  });
}
