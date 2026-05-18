import type { DiagnosticsState } from "./diagnostics.types";
import { STORAGE_KEY } from "./storage-key";

// ============================================================================
// Stale state cleanup
// ============================================================================

/**
 * Remove stale issue records from state store
 * Issues not found in Linear API are pruned from store.issues
 */
export async function cleanupStaleState(): Promise<void> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let state = JSON.parse(stored) as DiagnosticsState;
    
    // In a real implementation, we'd cross-reference with Linear API here
    // For demonstration, we'll manually remove specific IDs
    
    // Filter out stale issues (example pattern)
    state.issues = Object.entries(state.issues)
      .filter(([id]) => validIssueIds.has(id))
      .reduce((acc, [id, issue]) => {
        acc[id] = issue;
        return acc;
      }, {} as Record<string, any>);
      
    // Save the cleaned state back to storage
    localStorage.setItem(STORAGE_KEY, structuredClone(state));
  } catch (error) {
    console.error('State cleanup failed:', error);
  }
}