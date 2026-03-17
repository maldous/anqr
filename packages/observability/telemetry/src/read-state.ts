import type { DiagnosticsState } from "./diagnostics.types";
import { STORAGE_KEY } from "./storage-key";

// ============================================================================
// State management
// ============================================================================

/**
 * Read diagnostics state from localStorage
 */
export function readState(): DiagnosticsState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DiagnosticsState;
  } catch {
    return null;
  }
}
