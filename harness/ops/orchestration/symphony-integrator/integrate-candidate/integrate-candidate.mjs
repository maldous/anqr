import {
  dequeueIntegrationCandidate,
  getFinalizationState,
  setFinalizationState,
  getIssueState,
} from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { recordIntegrationResult } from "../../../core/task-evidence.mjs";
import { findIssueByIdentifier } from "../find-issue-by-identifier.mjs";
import { git } from "../git.mjs";
import { logInfo, logWarn, logError } from "../logger.mjs";
import { publishEvidenceAndClose } from "./publish-evidence-and-close.mjs";

export async function integrateCandidate(issueIdentifier) {
  const finalization = getFinalizationState(issueIdentifier);
  if (
    !finalization ||
    !["integration_pending", "evidence_pending_closeout"].includes(finalization.state)
  ) {
    logWarn(
      `[integrator] ${issueIdentifier}: unexpected finalization state: ${finalization?.state}`,
    );
    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: false, reason: "invalid_state" };
  }

  const { branch, headSha, correlationId } = finalization;

  if (finalization.state === "evidence_pending_closeout") {
    if (!finalization.integratedMainSha) {
      dequeueIntegrationCandidate(issueIdentifier);
      return { ok: false, reason: "missing_integrated_main_sha" };
    }
    const closeout = await publishEvidenceAndClose({
      issueIdentifier,
      finalization,
      pushedMainSha: finalization.integratedMainSha,
      changedFiles: finalization.changedFiles || [],
      diffStat: finalization.diffStat || "(cached)",
    });
    if (!closeout.ok) return closeout;
    dequeueIntegrationCandidate(issueIdentifier);
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
      logWarn(`[integrator] Cherry-pick failed for ${issueIdentifier}: ${stderr.slice(0, 200)}`);

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
      await setFinalizationState(issueIdentifier, {
        state: "integration_failed_repairable",
        lastError: stderr.slice(0, 500),
        attempts,
        updatedAt: new Date().toISOString(),
      });

      const issueState = getIssueState(issueIdentifier);
      const detail = issueState ? await findIssueByIdentifier(issueIdentifier) : null;
      if (detail) {
        await updateIssue(detail.id, { stateId: STATES.inReview });
        await addComment(
          detail.id,
          `⚠️ Integration to main failed due to conflict. Returned to same worktree for repair.\n\nError: ${stderr.slice(0, 300)}`,
        );
      }

      if (correlationId) {
        try {
          recordIntegrationResult(correlationId, {
            success: false,
            error: stderr.slice(0, 200),
          });
        } catch {
          /* best-effort evidence */
        }
      }

      dequeueIntegrationCandidate(issueIdentifier);
      return { ok: false, reason: "conflict" };
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

    await setFinalizationState(issueIdentifier, {
      state: "evidence_pending_closeout",
      integratedMainSha: pushedMainSha,
      changedFiles,
      diffStat,
      updatedAt: new Date().toISOString(),
      lastError: null,
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

    await setFinalizationState(issueIdentifier, {
      state: "integrated_main",
      integratedMainSha: pushedMainSha,
      changedFiles,
      diffStat,
      updatedAt: new Date().toISOString(),
      lastError: null,
    });

    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: true, mainSha: pushedMainSha };
  } catch (err) {
    logError(`[integrator] Unexpected error for ${issueIdentifier}: ${err.message}`);

    try {
      git("checkout", "main");
    } catch {
      /* best effort */
    }

    const attempts = (finalization.attempts || 0) + 1;
    await setFinalizationState(issueIdentifier, {
      state: "integration_failed_repairable",
      lastError: err.message.slice(0, 500),
      attempts,
      updatedAt: new Date().toISOString(),
    });

    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: false, reason: "infra_error", error: err.message };
  }
}
