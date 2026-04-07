import {
  setWorktreeState,
  getWorktreeState,
  recordQuarantine,
  releaseLease,
  setFinalizationState,
  getFinalizationState,
  enqueueIntegrationCandidate,
} from "../../symphony-state.mjs";
import {
  RECOVERY_MAX_REPAIR_ATTEMPTS,
  RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD,
} from "../../symphony-config.mjs";
import {
  getWorktreePath,
  getWorktreeBranch,
  PROJECT_ROOT,
  SYMPHONY_WORKTREE_IDS,
  DISCORD_WORKTREE_IDS,
} from "../../core/worktree-config.mjs";
import { execFileSync } from "node:child_process";
import { logInfo, logWarn } from "./logger.mjs";

export async function executeRepair(worktreeId, classification) {
  const { repairAction, inferredOwner } = classification;

  switch (repairAction) {
    case "skip":
      return { ok: true, action: "skip", nextState: "unchanged" };

    case "reclaim_lease": {
      // Release stale lease so runner can re-acquire
      if (inferredOwner) {
        releaseLease(inferredOwner);
        logInfo(`[recovery] Released stale lease for ${inferredOwner} on ${worktreeId}`);
      }
      // If we have a confident owner, set dirty_owned so runner picks it up
      if (classification.confidence >= RECOVERY_OWNERSHIP_CONFIDENCE_THRESHOLD && inferredOwner) {
        setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
        return { ok: true, action: "reclaim_lease", nextState: "dirty_owned" };
      }
      // Low confidence — quarantine
      return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
    }

    case "continue_repair": {
      // Ensure worktree state is set correctly for the runner to pick up
      setWorktreeState(worktreeId, { state: "dirty_owned", issueIdentifier: inferredOwner });
      logInfo(`[recovery] Confirmed repair state for ${worktreeId} (issue: ${inferredOwner})`);
      return { ok: true, action: "continue_repair", nextState: "dirty_owned" };
    }

    case "retry_push": {
      const worktreePath = getWorktreePath(worktreeId.replace(/^wt/, ""));
      try {
        // Prefer branch stored in finalization state; fall back to computed branch
        const fin = inferredOwner ? getFinalizationState(inferredOwner) : null;
        const branch = fin?.branch || getWorktreeBranch(worktreeId.replace(/^wt/, ""));
        execFileSync("git", ["push", "-u", "origin", `HEAD:${branch}`], {
          cwd: worktreePath,
          stdio: "pipe",
          timeout: 30_000,
          env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
        });
        const headSha = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: worktreePath,
          encoding: "utf-8",
          timeout: 5_000,
        }).trim();

        if (inferredOwner) {
          setFinalizationState(inferredOwner, {
            state: "integration_pending",
            branch,
            headSha,
            attempts: 0,
            lastError: null,
          });
          enqueueIntegrationCandidate(inferredOwner);
        }
        setWorktreeState(worktreeId, { state: "available", issueIdentifier: null });
        logInfo(`[recovery] Push retry succeeded for ${worktreeId}`);
        return { ok: true, action: "retry_push", nextState: "available" };
      } catch (err) {
        logWarn(`[recovery] Push retry failed for ${worktreeId}: ${err.message}`);
        // Increment attempts in finalization
        if (inferredOwner) {
          const fin = getFinalizationState(inferredOwner);
          const attempts = (fin?.attempts || 0) + 1;
          if (attempts >= RECOVERY_MAX_REPAIR_ATTEMPTS) {
            return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
          }
          setFinalizationState(inferredOwner, { attempts });
        }
        return {
          ok: false,
          action: "retry_push",
          nextState: "branch_push_failed",
          error: err.message,
        };
      }
    }

    case "auto_commit_and_push": {
      const isMainRepo = worktreeId === "main";
      const acapPath = isMainRepo
        ? PROJECT_ROOT
        : getWorktreePath(worktreeId.replace(/^wt/, ""));

      try {
        execFileSync("git", ["add", "-A"], {
          cwd: acapPath,
          stdio: "pipe",
          timeout: 15_000,
        });

        const commitMsg = inferredOwner
          ? `fix(harness): auto-commit ${inferredOwner} via fleet recovery daemon`
          : `fix(harness): auto-commit dirty changes via fleet recovery daemon`;
        execFileSync("git", ["commit", "-m", commitMsg, "--no-verify"], {
          cwd: acapPath,
          stdio: "pipe",
          timeout: 30_000,
          env: { ...process.env, ANQR_AUTOMATION_COMMIT: "1" },
        });

        const headSha = execFileSync("git", ["rev-parse", "HEAD"], {
          cwd: acapPath,
          encoding: "utf-8",
          timeout: 5_000,
        }).trim();

        logInfo(`[recovery] Auto-committed in ${worktreeId} (${headSha.slice(0, 8)})`);

        if (isMainRepo) {
          execFileSync("git", ["push", "origin", "main"], {
            cwd: acapPath,
            stdio: "pipe",
            timeout: 30_000,
            env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
          });
          logInfo(`[recovery] Pushed main to origin`);

          const worktreeIds = [
            ...SYMPHONY_WORKTREE_IDS.filter((id) => id !== "main"),
            ...DISCORD_WORKTREE_IDS,
          ];
          for (const id of worktreeIds) {
            try {
              const wtPath = getWorktreePath(id);
              execFileSync("git", ["fetch", "origin", "main"], {
                cwd: wtPath,
                stdio: "pipe",
                timeout: 15_000,
              });
              execFileSync("git", ["merge", "origin/main", "--ff-only"], {
                cwd: wtPath,
                stdio: "pipe",
                timeout: 15_000,
              });
              logInfo(`[recovery] Synced wt${id} with main`);
            } catch (syncErr) {
              logWarn(`[recovery] Failed to sync wt${id}: ${syncErr.message}`);
            }
          }
        } else {
          const branch = getWorktreeBranch(worktreeId.replace(/^wt/, ""));
          execFileSync("git", ["push", "-u", "origin", `HEAD:${branch}`], {
            cwd: acapPath,
            stdio: "pipe",
            timeout: 30_000,
            env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
          });
          logInfo(`[recovery] Pushed ${worktreeId} to ${branch}`);

          if (inferredOwner) {
            setFinalizationState(inferredOwner, {
              state: "integration_pending",
              branch,
              headSha,
              worktreeId,
              attempts: 0,
              lastError: null,
            });
            enqueueIntegrationCandidate(inferredOwner);
            logInfo(`[recovery] Enqueued ${inferredOwner} for integration from ${worktreeId}`);
          } else {
            logWarn(`[recovery] No owner inferred for ${worktreeId} — pushed to ${branch} but not enqueued for integration`);
          }
        }

        setWorktreeState(worktreeId, { state: "available", issueIdentifier: null });
        return { ok: true, action: "auto_commit_and_push", nextState: "available" };
      } catch (err) {
        logWarn(`[recovery] Auto-commit/push failed for ${worktreeId}: ${err.message}`);
        return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" });
      }
    }

    case "quarantine": {
      const wtState = getWorktreeState(worktreeId);
      recordQuarantine(worktreeId, {
        reason: classification.classification,
        repairAttempts: wtState?.repairAttempts || 0,
        lastError: `Classification: ${classification.classification}, confidence: ${classification.confidence}`,
      });
      logWarn(`[recovery] Quarantined ${worktreeId} (${classification.classification})`);
      return { ok: true, action: "quarantine", nextState: "quarantined" };
    }

    case "reprovision": {
      // Defer to fleet health service — just mark for reprovisioning
      recordQuarantine(worktreeId, {
        reason: "missing",
        lastError: "Worktree directory does not exist",
      });
      logWarn(`[recovery] Marked ${worktreeId} for reprovisioning (missing)`);
      return { ok: true, action: "reprovision", nextState: "quarantined" };
    }

    default:
      logWarn(`[recovery] Unknown repair action: ${repairAction}`);
      return {
        ok: false,
        action: repairAction || "unknown",
        nextState: "unchanged",
        error: "unknown action",
      };
  }
}
