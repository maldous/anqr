import {
  setWorktreeState,
  getWorktreeState,
  getIssueState,
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
import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";
import { voiceAnnounce } from "../../integrations/model/symphony-openai-bridge/voice-announce.mjs";
import { logInfo, logWarn } from "./logger.mjs";

function extractFileNames(dirtyFiles) {
  return dirtyFiles
    .map((line) =>
      line
        .replace(/^\S+\s+/, "")
        .trim()
        .split("/")
        .pop(),
    )
    .filter(Boolean);
}

function formatFileSummary(dirtyFiles) {
  const names = extractFileNames(dirtyFiles);
  if (names.length === 0) return "files updated";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} (+${names.length - 2} more)`;
}

function buildCommitMessage(worktreeId, issueId, dirtyFiles) {
  const summary = formatFileSummary(dirtyFiles);
  if (issueId) return `fix(${issueId}): auto-commit ${worktreeId} — ${summary}`;
  return `chore: auto-commit ${worktreeId} — ${summary}`;
}

export async function executeRepair(worktreeId, classification, snapshot = {}) {
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
      return executeRepair(worktreeId, { ...classification, repairAction: "quarantine" }, snapshot);
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
            return executeRepair(
              worktreeId,
              { ...classification, repairAction: "quarantine" },
              snapshot,
            );
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
      const acapPath = isMainRepo ? PROJECT_ROOT : getWorktreePath(worktreeId.replace(/^wt/, ""));

      try {
        const dirtyFiles = snapshot.gitDirtyFiles || [];
        const issueId = snapshot.issueIdentifier || inferredOwner;
        const issueRecord = issueId ? getIssueState(issueId) : null;
        const provider = issueRecord?.notes?.lastProvider || null;
        const discordMessageId = issueRecord?.notes?.discordMessageId || null;

        execFileSync("git", ["add", "-A"], {
          cwd: acapPath,
          stdio: "pipe",
          timeout: 15_000,
        });

        const commitMsg = buildCommitMessage(worktreeId, issueId, dirtyFiles);
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

        const fileCount = dirtyFiles.length || 1;
        const fileSummary = formatFileSummary(dirtyFiles);

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
              try {
                execFileSync("git", ["merge", "origin/main", "--ff-only"], {
                  cwd: wtPath,
                  stdio: "pipe",
                  timeout: 15_000,
                });
              } catch (ffErr) {
                // Fall back to --no-ff merge if fast-forward is not possible
                logWarn(
                  `[recovery] Fast-forward failed for wt${id}, trying --no-ff: ${ffErr.message}`,
                );
                try {
                  execFileSync(
                    "git",
                    ["merge", "origin/main", "--no-ff", "-m", "Merge main into wt" + id],
                    {
                      cwd: wtPath,
                      stdio: "pipe",
                      timeout: 15_000,
                      env: { ...process.env, ANQR_AUTOMATION_COMMIT: "1" },
                    },
                  );
                } catch (mergeErr) {
                  logWarn(
                    `[recovery] Both ff and non-ff merge failed for wt${id}: ${mergeErr.message} - skipping sync`,
                  );
                  // Continue to push even if merge failed - don't block other worktrees
                  continue;
                }
              }
              const wtBranch = getWorktreeBranch(id);
              execFileSync("git", ["push", "-u", "origin", `HEAD:${wtBranch}`], {
                cwd: wtPath,
                stdio: "pipe",
                timeout: 30_000,
                env: { ...process.env, ANQR_AUTOMATION_PUSH: "1" },
              });
              logInfo(`[recovery] Synced wt${id} with main`);
            } catch (syncErr) {
              logWarn(`[recovery] Failed to sync wt${id}: ${syncErr.message}`);
            }
          }

          const mainDescParts = [issueId, provider].filter(Boolean);
          sendDiscordEmbed({
            title: "Auto-commit | main",
            description: mainDescParts.length > 0 ? mainDescParts.join(" · ") : undefined,
            color: 0x5865f2,
            fields: [
              { name: "Files", value: `${fileCount} — ${fileSummary}`, inline: false },
              { name: "Commit", value: `\`${headSha.slice(0, 8)}\` → main`, inline: true },
            ],
            ...(discordMessageId ? { replyTo: discordMessageId } : { threadName: "ANQR" }),
          }).catch(() => {});
          voiceAnnounce(`Auto-committed ${fileCount} files on main.`);
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
            logWarn(
              `[recovery] No owner inferred for ${worktreeId} — pushed to ${branch} but not enqueued for integration`,
            );
          }

          const descParts = [issueId, provider, `${fileCount} files`].filter(Boolean);
          sendDiscordEmbed({
            title: `Auto-commit | ${worktreeId}`,
            description: descParts.join(" · "),
            color: 0x5865f2,
            fields: [
              { name: "Files", value: fileSummary, inline: false },
              { name: "Commit", value: `\`${headSha.slice(0, 8)}\` → ${branch}`, inline: true },
            ],
            ...(discordMessageId ? { replyTo: discordMessageId } : { threadName: "ANQR" }),
          }).catch(() => {});
          voiceAnnounce(
            issueId
              ? `Auto-committed ${issueId} in ${worktreeId}, ${fileCount} files.`
              : `Auto-committed ${fileCount} files in ${worktreeId}.`,
          );
        }

        setWorktreeState(worktreeId, { state: "available", issueIdentifier: null });
        return { ok: true, action: "auto_commit_and_push", nextState: "available" };
      } catch (err) {
        logWarn(`[recovery] Auto-commit/push failed for ${worktreeId}: ${err.message}`);
        return executeRepair(
          worktreeId,
          { ...classification, repairAction: "quarantine" },
          snapshot,
        );
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

    case "reset_to_main": {
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

        return { ok: true, action: "reset_to_main", nextState: "available" };
      } catch (err) {
        logWarn(`[recovery] Reset to main failed for ${worktreeId}: ${err.message}`);
        return executeRepair(
          worktreeId,
          { ...classification, repairAction: "quarantine" },
          snapshot,
        );
      }
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
