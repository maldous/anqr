import { RECOVERY_COOLDOWN_MS } from "./recovery-cooldown-ms.mjs";
import { lastRecoveryAction } from "./last-recovery-action.mjs";
import { logInfo } from "./logger.mjs";

export function isInCooldown(serviceName) {
  const lastRecovery = lastRecoveryAction.get(serviceName);
  if (!lastRecovery) return false;

  const cooldownRemaining = Date.now() - lastRecovery;
  if (cooldownRemaining < RECOVERY_COOLDOWN_MS) {
    logInfo(
      `[watchdog] ⏳ ${serviceName}: Recovery cooldown active (${Math.round((RECOVERY_COOLDOWN_MS - cooldownRemaining) / 1000)}s remaining)`,
    );
    return true;
  }

  // Cooldown expired, reset
  lastRecoveryAction.delete(serviceName);
  return false;
}
