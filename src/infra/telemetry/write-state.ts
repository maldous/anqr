import type { DiagnosticsState } from "./diagnostics.types";
import { STORAGE_KEY } from "./storage-key";

/**
 * Write diagnostics state to localStorage
 */
export function writeState(state: DiagnosticsState | null): void {
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
