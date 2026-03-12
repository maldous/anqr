import { createLogger } from '../logging/logger';

export const log = createLogger('DIAG');

// ============================================================================
// Configuration
// ============================================================================

const STORAGE_KEY = 'anqr_diagnostics';

export const DEFAULT_TTL_MINUTES = 60;

export const MAX_TTL_MINUTES = 120;

export interface DiagnosticsState {
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

export { STORAGE_KEY, readState, writeState, isEnabled };
