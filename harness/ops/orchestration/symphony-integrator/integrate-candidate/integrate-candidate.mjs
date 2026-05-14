import { getFinalizationState, transitionIssue, getIssueState } from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { recordIntegrationResult, MAX_EVIDENCE_RETRIES } from "../../../core/task-evidence.mjs";
import { findIssueByIdentifier } from "../find-issue-by-identifier.mjs";
import { git } from "../git.mjs";
import { logInfo, logWarn, logError } from "../logger.mjs";
import { safetyCap } from "../../../lib/safety-cap.mjs";
import { forceCloseWithIncompleteEvidence } from "./force-close-with-incomplete-evidence.mjs";
import { publishEvidenceAndClose } from "./publish-evidence-and-close.mjs";
import { critiqueDiff } from "../../symphony-critique/critique-diff.mjs";
import { extractPlanComment } from "../../symphony-critique/extract-plan-comment.mjs";

export async function integrateCandidate(issueIdentifier) {
  const finalization = getFinalizationState(issueIdentifier);
  if (
    !finalization ||
    !["integration_pending", "evidence_pending_closeout"].includes(finalization.state)
  ) {
    logWarn(
      `[integrator] ${issueIdentifier}: unexpected finalization state: ${finalization?.state}`,
    );
    return { ok: false, reason: "invalid_state" };
  }

  const { branch, headSha, correlationId } = finalization;

  if (finalization.state === "evidence_pending_closeout") {
    if (!finalization.integratedMainSha) {
      return { ok: false, reason: "missing_integrated_main_sha" };
    }

    // After MAX_EVIDENCE_RETRIES, force-close with incomplete evidence
    if ((finalization.evidenceRetries || 0) >= MAX_EVIDENCE_RETRIES) {
      logWarn(
        `[integrator] ${issueIdentifier}: evidence retries exhausted (${finalization.evidenceRetries}), forcing closure`,
      );
      const forced = await forceCloseWithIncompleteEvidence({
        issueIdentifier,
        finalization,
        pushedMainSha: finalization.integratedMainSha,
        changedFiles: finalization.changedFiles || [],
        diffStat: finalization.diffStat || "(cached)",
        operatorReason: `Auto-override after ${MAX_EVIDENCE_RETRIES} failed evidence collection attempts`,
      });
      if (forced.ok) {
        transitionIssue(issueIdentifier, "completed", {
          finalization: {
            state: "integrated_main",
            integratedMainSha: finalization.integratedMainSha,
            changedFiles: finalization.changedFiles || [],
            diffStat: finalization.diffStat || "(cached)",
            evidenceOverride: true,
            updatedAt: new Date().toISOString(),
            lastError: null,
          },
          reason: "evidence_override",
        });
      }
      return forced;
    }

    const closeout = await publishEvidenceAndClose({
      issueIdentifier,
      finalization,
      pushedMainSha: finalization.integratedMainSha,
      changedFiles: finalization.changedFiles || [],
      diffStat: finalization.diffStat || "(cached)",
    });
    if (!closeout.ok) return closeout;
    return { ok: true, mainSha: finalization.integratedMainSha, closeoutOnly: true };
  }

  if (!branch || !headSha) {
    logWarn(`[integrator] ${issueIdentifier}: missing branch or headSha`);
    return { ok: false, reason: "missing_metadata" };
  }

  logInfo(
    `[integrator] Integrating ${issueIdentifier}: branch=${branch} head=${headSha.slice(0, 8)}`,
  );
  const integrationStartMs = Date.now();

  try {
    git("fetch", "origin", "main");
    git("fetch", "origin", branch);

    try {
      git("branch", "-D", "symphony/integration");
    } catch {
      /* branch may not exist */
    }
    git("checkout", "-B", "symphony/integration", "origin/main");

    try {
      git("cherry-pick", headSha);
    } catch (cpErr) {
      const stderr = cpErr.stderr?.toString() || cpErr.message || "";
      logWarn(`[integrator] Cherry-pick failed for ${issueIdentifier}: ${stderr}`);

      try {
        git("cherry-pick", "--abort");
      } catch {
        /* already clean */
      }
      try {
        git("checkout", "main");
      } catch {
        /* best effort */
      }

      const attempts = (finalization.attempts || 0) + 1;
      transitionIssue(issueIdentifier, "integration_failed", {
        finalization: {
          state: "integration_failed_repairable",
          lastError: stderr,
          attempts,
          updatedAt: new Date().toISOString(),
        },
        reason: "cherry_pick_conflict",
      });

      const issueState = getIssueState(issueIdentifier);
      const detail = issueState ? await findIssueByIdentifier(issueIdentifier) : null;
      if (detail) {
        await updateIssue(detail.id, { stateId: STATES.inReview });
        await addComment(
          detail.id,
          safetyCap(`⚠️ Integration to main failed due to conflict. Returned to same worktree for repair.\n\nError: ${stderr}`),
        );
      }

      if (correlationId) {
        try {
          recordIntegrationResult(correlationId, {
            success: false,
            error: stderr,
          });
        } catch {
          /* best-effort evidence */
        }
      }

      return { ok: false, reason: "conflict" };
    }

    // Collect diff for critique before pushing to main
    let prePushDiff = "";
    try {
      prePushDiff = git("diff", "origin/main..HEAD");
    } catch {
      /* best-effort */
    }

    // Critique: LLM reviews diff vs plan before merging. Soft failure — critique
    // errors never block integration. Rejection sends issue back for repair.
    if (prePushDiff) {
      const issueDetail = await findIssueByIdentifier(issueIdentifier).catch(() => null);
      const planComment = issueDetail ? extractPlanComment(issueDetail) : null;
      try {
        const { approved, critiqueText } = await critiqueDiff({
          issueIdentifier,
          issueId: issueDetail?.id || null,
          diff: prePushDiff,
          planComment,
        });
        if (!approved) {
          logWarn(`[integrator] Critique REJECTED ${issueIdentifier} — sending back for repair`);
          try {
            git("cherry-pick", "--abort");
          } catch { /* already clean */ }
          git("checkout", "main");
          transitionIssue(issueIdentifier, "integration_failed", {
            finalization: {
              state: "integration_failed_repairable",
              lastError: `Critique rejected: ${critiqueText.slice(0, 300)}`,
              attempts: (finalization.attempts || 0) + 1,
              updatedAt: new Date().toISOString(),
            },
            reason: "critique_rejected",
          });
          if (issueDetail) {
            await updateIssue(issueDetail.id, { stateId: STATES.inReview });
          }
          return { ok: false, reason: "critique_rejected" };
        }
        logInfo(`[integrator] Critique APPROVED ${issueIdentifier}`);
      } catch (err) {
        logWarn(`[integrator] Critique failed for ${issueIdentifier} (proceeding): ${err.message}`);
      }
    }

    git("push", "origin", "HEAD:main");
    const pushedMainSha = git("rev-parse", "HEAD");

    const integrationMs = Date.now() - integrationStartMs;
    logInfo(
      `[integrator] ✅ ${issueIdentifier} integrated to main at ${pushedMainSha.slice(0, 8)} (${integrationMs}ms)`,
    );

    if (correlationId) {
      try {
        recordIntegrationResult(correlationId, {
          success: true,
          mainSha: pushedMainSha,
          method: "cherry-pick",
        });
      } catch {
        /* best-effort evidence */
      }
    }

    let changedFiles = [];
    let diffStat = "";
    try {
      changedFiles = git("diff", "--name-only", `${pushedMainSha}^`, pushedMainSha)
        .split("\n")
        .filter(Boolean);
      diffStat = git("diff", "--stat", `${pushedMainSha}^`, pushedMainSha);
    } catch {
      /* best-effort evidence collection */
    }

    transitionIssue(issueIdentifier, "evidence_pending", {
      finalization: {
        state: "evidence_pending_closeout",
        integratedMainSha: pushedMainSha,
        changedFiles,
        diffStat,
        updatedAt: new Date().toISOString(),
        lastError: null,
      },
      reason: "integration_success",
    });

    const closeout = await publishEvidenceAndClose({
      issueIdentifier,
      finalization: { ...finalization, integratedMainSha: pushedMainSha },
      pushedMainSha,
      changedFiles,
      diffStat,
    });
    if (!closeout.ok) {
      logWarn(`[integrator] Evidence publish deferred for ${issueIdentifier}: ${closeout.reason}`);
      return closeout;
    }

    transitionIssue(issueIdentifier, "completed", {
      finalization: {
        state: "integrated_main",
        integratedMainSha: pushedMainSha,
        changedFiles,
        diffStat,
        updatedAt: new Date().toISOString(),
        lastError: null,
      },
      reason: "evidence_published",
    });

    return { ok: true, mainSha: pushedMainSha };
  } catch (err) {
    logError(`[integrator] Unexpected error for ${issueIdentifier}: ${err.message}`);

    try {
      git("checkout", "main");
    } catch {
      /* best effort */
    }

    const attempts = (finalization.attempts || 0) + 1;
    transitionIssue(issueIdentifier, "integration_failed", {
      finalization: {
        state: "integration_failed_repairable",
        lastError: err.message,
        attempts,
        updatedAt: new Date().toISOString(),
      },
      reason: "infra_error",
    });

    return { ok: false, reason: "infra_error", error: err.message };
  }
}
