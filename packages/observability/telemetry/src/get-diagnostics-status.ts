import { getLogLevel } from "../../logging/src";
import { isEnabled } from "./is-enabled";
import { readState } from "./read-state";

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
