import { readState } from './read-state';
import { writeState } from './write-state';

/**
 * Check if diagnostics is currently enabled and not expired
 */
export function isEnabled(): boolean {
  const state = readState();
  if (!state?.enabled) return false;
  if (Date.now() > state.expiresAt) {
    // Expired - clean up
    writeState(null);
    return false;
  }
  return true;
}
