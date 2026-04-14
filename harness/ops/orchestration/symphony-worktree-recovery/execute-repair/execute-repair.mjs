import {
  setWorktreeState,
  getWorktreeState,
  recordQuarantine,
  releaseLease,
  leaseIsActive,
} from "../../../symphony-state.mjs";
import { RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD } from "../../../symphony-config.mjs";
import { getWorktreePath, PROJECT_ROOT } from "../../../core/worktree-config.mjs";
import { execFileSync } from "node:child_process";
import { sendDiscordEmbed } from "../../../integrations/notifications/openclaw-discord.mjs";
import { logInfo, logWarn } from "../logger.mjs";

/**
 * Build structured evidence for a recovery action — ADR-0006.
 *
 * Every recovery action must emit evidence identifying:
 * - actionClass: state_only | quarantine | reprovision | sandbox_reset | demotion
 * - target: worktreeId
 * - reason: why this action was taken
 * - ownershipBasis: inferred owner or null
 * - isStateOnly: whether the action only modifies durable state (no filesystem)
 * - isNonPublishing: whether the action does NOT commit/push/publish code
 */
function buildEvidence(actionClass, worktreeId, reason, ownershipBasis = null) {
  // ADR-0005: All recovery actions are non-publishing. ADR-0006: Evidence
  // must classify actions explicitly rather than inheriting a default.
  // These sets enumerate every known action class so that adding a new class
  // forces a conscious classification decision.
  const STATE_ONLY_ACTIONS = new Set([
    "skip",
    "reclaim_lease",
    "continue_repair",
    "quarantine",
    "reprovision",
  ]);
  const NON_PUBLISHING_ACTIONS = new Set([
    "skip",
    "reclaim_lease",
    "continue_repair",
    "quarantine",
    "reprovision",
    "sandbox_reset",
    "demotion",
  ]);

  const effectiveClass = actionClass === "demotion" ? "quarantine" : actionClass;
  const isStateOnly = STATE_ONLY_ACTIONS.has(effectiveClass);
  // Use original actionClass for isNonPublishing so that every class
  // (including "demotion" itself) is explicitly enumerated in the set.
  const isNonPublishing = NON_PUBLISHING_ACTIONS.has(actionClass);

  return {
    actionClass,
    target: worktreeId,
    reason,
    ownershipBasis,
    isStateOnly,
    isNonPublishing,
    timestamp: new Date().toISOString(),
  };
}

export async function executeRepair(worktreeId, classification) {
  const { repairAction, inferredOwner } = classification;

  switch (repairAction) {
    case "skip":
      return {
        ok: true,
        action: "skip",
        nextState: "unchanged",
        evidence: buildEvidence("skip", worktreeId, "active_or_clean"),
      };

    case "reclaim_lease": {
      if (inferredOwner) {
        releaseLease(inferredOwner);
        logInfo(`[recovery] Released stale lease for ${inferredOwner} on ${worktreeId}`);
      }
      if (classification.confidence >= RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD && inferredOwner) {
        setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
        return {
          ok: true,
          action: "reclaim_lease",
          nextState: "dirty_owned",
          evidence: buildEvidence(
            "reclaim_lease",
            worktreeId,
            "stale_lease_released",
            inferredOwner,
          ),
        };
      }
      return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
    }

    case "continue_repair": {
      setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
      logInfo(`[recovery] Confirmed repair state for ${worktreeId} (issue: ${inferredOwner})`);
      return {
        ok: true,
        action: "continue_repair",
        nextState: "dirty_owned",
        evidence: buildEvidence(
          "continue_repair",
          worktreeId,
          "repair_state_confirmed",
          inferredOwner,
        ),
      };
    }

    case "retry_push": {
      // ADR-0005: Recovery shall not publish code. Quarantine instead.
      logWarn(
        `[recovery] retry_push requested for ${worktreeId} — demoted to quarantine (ADR-0005: recovery shall not publish code)`,
      );
      const result = await executeRepair(
        worktreeId,
        { ...classification, repairAction: "quarantine" },
      );
      // Override evidence to record the demotion
      result.evidence = buildEvidence(
        "demotion",
        worktreeId,
        "retry_push_demoted_to_quarantine",
        inferredOwner,
      );
      return result;
    }

    case "auto_commit_and_push": {
      // ADR-0005: Recovery shall not publish code — no auto-commit, no auto-push.
      logWarn(
        `[recovery] auto_commit_and_push requested for ${worktreeId} — demoted to quarantine (ADR-0005: recovery shall not publish code)`,
      );
      const result = await executeRepair(
        worktreeId,
        { ...classification, repairAction: "quarantine" },
      );
      result.evidence = buildEvidence(
        "demotion",
        worktreeId,
        "auto_commit_and_push_demoted_to_quarantine",
        inferredOwner,
      );
      return result;
    }

    case "quarantine": {
      const wtState = getWorktreeState(worktreeId);
      recordQuarantine(worktreeId, {
        reason: classification.classification,
        repairAttempts: wtState?.repairAttempts || 0,
        lastError: `Classification: ${classification.classification}, confidence: ${classification.confidence}`,
      });
      logWarn(`[recovery] Quarantined ${worktreeId} (${classification.classification})`);
      return {
        ok: true,
        action: "quarantine",
        nextState: "quarantined",
        evidence: buildEvidence(
          "quarantine",
          worktreeId,
          classification.classification,
          inferredOwner,
        ),
      };
    }

    case "reset_to_main": {
      // ADR-0005 + ADR-0006: reset_to_main is SANDBOX MAINTENANCE, not code publishing.
      //
      // This is an explicitly allowed exception to state-only recovery. It resets
      // an inactive, diverged worktree to origin/main so it can be reused by the
      // executor fleet. It is classified as sandbox_reset (not state_only) because
      // it performs git fetch/reset/clean, but it is non-publishing because it
      // never commits, pushes, or publishes code.
      //
      // Safety guarantees:
      // 1. Active-lease guard prevents reset of worktrees with live execution
      // 2. Only triggered for diverged worktrees (classify-worktree.mjs)
      // 3. Evidence emitted with actionClass: "sandbox_reset", isNonPublishing: true
      // 4. On failure, falls back to quarantine (no partial state)
      //
      // Defense-in-depth: explicitly verify the sandbox is not actively executing.
      const wtState = getWorktreeState(worktreeId);
      if (wtState && leaseIsActive(wtState)) {
        logWarn(
          `[recovery] reset_to_main blocked: ${worktreeId} has an active lease — quarantining instead`,
        );
        return executeRepair(
          worktreeId,
          { ...classification, repairAction: "quarantine" },
        );
      }

      const resetPath =
        worktreeId === "main" ? PROJECT_ROOT : getWorktreePath(worktreeId.replace(/^wt/, ""));
      try {
        execFileSync("git", ["fetch", "origin", "main"], {
          cwd: resetPath,
          stdio: "pipe",
          timeout: 15_000,
        });
        execFileSync("git", ["reset", "--hard", "origin/main"], {
          cwd: resetPath,
          stdio: "pipe",
          timeout: 15_000,
        });
        execFileSync("git", ["clean", "-fd"], {
          cwd: resetPath,
          stdio: "pipe",
          timeout: 15_000,
        });
        setWorktreeState(worktreeId, { state: "available", issueIdentifier: null });
        logInfo(`[recovery] Reset ${worktreeId} to origin/main (divergence resolved)`);

        sendDiscordEmbed({
          title: `🔧 Divergence Resolved | ${worktreeId}`,
          description: "Reset to origin/main after branch divergence",
          color: 0x00ff00,
          threadName: "ANQR",
        }).catch(() => {});

        return {
          ok: true,
          action: "reset_to_main",
          nextState: "available",
          evidence: buildEvidence("sandbox_reset", worktreeId, "divergence_resolved"),
        };
      } catch (err) {
        logWarn(`[recovery] Reset to main failed for ${worktreeId}: ${err.message}`);
        return executeRepair(
          worktreeId,
          { ...classification, repairAction: "quarantine" },
        );
      }
    }

    case "reprovision": {
      recordQuarantine(worktreeId, {
        reason: "missing",
        lastError: "Worktree directory does not exist",
      });
      logWarn(`[recovery] Marked ${worktreeId} for reprovisioning (missing)`);
      return {
        ok: true,
        action: "reprovision",
        nextState: "quarantined",
        evidence: buildEvidence("reprovision", worktreeId, "worktree_missing"),
      };
    }

    default:
      logWarn(`[recovery] Unknown repair action: ${repairAction}`);
      return {
        ok: false,
        action: repairAction || "unknown",
        nextState: "unchanged",
        error: "unknown action",
        evidence: buildEvidence("skip", worktreeId, `unknown_action_${repairAction || "null"}`),
      };
  }
}
