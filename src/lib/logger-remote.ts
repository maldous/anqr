/**
 * Remote Diagnostics Controller
 *
 * Enables verbose logging on specific remote clients at runtime.
 * Uses localStorage with TTL to persist diagnostic mode across page reloads.
 *
 * Usage:
 *   // In browser console to enable diagnostics for 30 minutes:
 *   window.anqrDiag.enable(30, 'debugging overlay issue')
 *
 *   // To disable:
 *   window.anqrDiag.disable()
 *
 *   // To check status:
 *   window.anqrDiag.status()
 */

import {
  clearStructuredLogs,
  createLogger,
  getLogLevel,
  getStructuredLogCount,
  getStructuredLogs,
  resetLogLevel,
  saveLogs,
  setLogLevel,
} from './logger';

const log = createLogger('DIAG');

// ============================================================================
// Configuration
// ============================================================================

const STORAGE_KEY = 'anqr_diagnostics';
const DEFAULT_TTL_MINUTES = 60;
const MAX_TTL_MINUTES = 120;

interface DiagnosticsState {
  enabled: boolean;
  expiresAt: number; // Unix timestamp in milliseconds
  reason: string;
  enabledAt: number; // Unix timestamp when enabled
}

// ============================================================================
// State management
// ============================================================================

/**
 * Read diagnostics state from localStorage
 */
function readState(): DiagnosticsState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DiagnosticsState;
  } catch {
    return null;
  }
}

/**
 * Write diagnostics state to localStorage
 */
function writeState(state: DiagnosticsState | null): void {
  try {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may not be available
  }
}

/**
 * Check if diagnostics is currently enabled and not expired
 */
function isEnabled(): boolean {
  const state = readState();
  if (!state?.enabled) return false;
  if (Date.now() > state.expiresAt) {
    // Expired - clean up
    writeState(null);
    return false;
  }
  return true;
}

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

/**
 * Get current diagnostics status.
 */
export function getDiagnosticsStatus(): {
  enabled: boolean;
  expiresAt: Date | null;
  remainingMinutes: number;
  reason: string | null;
  currentLevel: string;
} {
  const state = readState();
  const enabled = isEnabled();
  const now = Date.now();

  return {
    enabled,
    expiresAt: state?.expiresAt ? new Date(state.expiresAt) : null,
    remainingMinutes: enabled && state ? Math.round((state.expiresAt - now) / 60000) : 0,
    reason: state?.reason || null,
    currentLevel: getLogLevel(),
  };
}

/**
 * Initialize remote diagnostics on app startup.
 * Checks for existing diagnostic state and applies it.
 * Should be called early in app initialization, after Sentry.
 */
export function initRemoteDiagnostics(): void {
  const state = readState();

  if (state?.enabled) {
    if (Date.now() > state.expiresAt) {
      // Expired - clean up and use default level
      writeState(null);
      log.info('Diagnostics expired on restart, reverting to default level');
    } else {
      // Still valid - apply debug level
      setLogLevel('debug');
      const remaining = Math.round((state.expiresAt - Date.now()) / 60000);
      log.info('Diagnostics restored from storage', {
        remainingMinutes: remaining,
        reason: state.reason,
      });
    }
  }

  // Expose to window for console access
  if (typeof window !== 'undefined') {
    (window as Window & { anqrDiag?: unknown }).anqrDiag = {
      enable: enableDiagnostics,
      disable: disableDiagnostics,
      status: () => {
        const s = getDiagnosticsStatus();
        console.log('ANQR Diagnostics Status:', s);
        return s;
      },
      // Log saving functions
      saveLogs: (filename?: string) => {
        saveLogs(filename);
      },
      getLogs: () => {
        const logs = getStructuredLogs();
        // biome-ignore lint/suspicious/noConsole: Intentional user feedback
        console.log(`${logs.length} log entries (expand objects below):`);
        return logs;
      },
      clearLogs: () => {
        clearStructuredLogs();
        // biome-ignore lint/suspicious/noConsole: Intentional user feedback
        console.log('Structured log buffer cleared.');
      },
      logCount: () => {
        const count = getStructuredLogCount();
        // biome-ignore lint/suspicious/noConsole: Intentional user feedback
        console.log(`${count} log entries in buffer`);
        return count;
      },
      help: () => {
        console.log(`
ANQR Diagnostics Commands:
  anqrDiag.enable(minutes?, reason?)  - Enable debug logging (default 60 min)
  anqrDiag.disable()                  - Disable debug logging
  anqrDiag.status()                   - Show current status

Log Saving (objects fully expanded in output):
  anqrDiag.saveLogs(filename?)        - Download logs as JSON file
  anqrDiag.getLogs()                  - Get logs array in console (expandable)
  anqrDiag.clearLogs()                - Clear the log buffer
  anqrDiag.logCount()                 - Show number of buffered logs

  anqrDiag.help()                     - Show this help

Examples:
  anqrDiag.enable(30, 'debugging overlay issue')
  anqrDiag.saveLogs()                 - Downloads anqr-logs-{timestamp}.json
  anqrDiag.saveLogs('my-debug.json')  - Downloads with custom filename
        `);
      },
    };
  }
}
