import {
  dequeueIntegrationCandidate,
  getFinalizationState,
  setFinalizationState,
  getIssueState,
} from "../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../linear-client.mjs";
import { recordIntegrationResult } from "../../core/task-evidence.mjs";

import { findIssueByIdentifier } from "./find-issue-by-identifier.mjs";
import { git } from "./git.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function integrateCandidate(issueIdentifier) {
  const finalization = getFinalizationState(issueIdentifier);
  if (!finalization || finalization.state !== "integration_pending") {
    logWarn(
      `[integrator] ${issueIdentifier}: unexpected finalization state: ${finalization?.state}`,
    );
    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: false, reason: "invalid_state" };
  }

  const { branch, headSha, correlationId } = finalization;
  if (!branch || !headSha) {
    logWarn(`[integrator] ${issueIdentifier}: missing branch or headSha`);
    return { ok: false, reason: "missing_metadata" };
  }

  logInfo(
    `[integrator] Integrating ${issueIdentifier}: branch=${branch} head=${headSha.slice(0, 8)}`,
  );
  const integrationStartMs = Date.now();

  try {
    // Fetch latest refs — fetch branch explicitly to handle force-pushed branches after conflict repair
    git("fetch", "origin", "main");
    git("fetch", "origin", branch);

    // Create clean integration workspace
    try {
      git("branch", "-D", "symphony/integration");
    } catch {
      /* branch may not exist */
    }
    git("checkout", "-B", "symphony/integration", "origin/main");

    // Cherry-pick the candidate commit
    try {
      git("cherry-pick", headSha);
    } catch (cpErr) {
      // Cherry-pick failed — likely a conflict
      const stderr = cpErr.stderr?.toString() || cpErr.message || "";
      logWarn(`[integrator] Cherry-pick failed for ${issueIdentifier}: ${stderr.slice(0, 200)}`);

      // Abort the cherry-pick
      try {
        git("cherry-pick", "--abort");
      } catch {
        /* already clean */
      }

      // Return to main
      try {
        git("checkout", "main");
      } catch {
        /* best effort */
      }

      // Mark as integration_failed_repairable
      const attempts = (finalization.attempts || 0) + 1;
      await setFinalizationState(issueIdentifier, {
        state: "integration_failed_repairable",
        lastError: stderr.slice(0, 500),
        attempts,
        updatedAt: new Date().toISOString(),
      });

      // Update Linear
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

    // Push to main
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

    // Get changed files from the cherry-pick for evidence
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

    // Update finalization state
    await setFinalizationState(issueIdentifier, {
      state: "integrated_main",
      integratedMainSha: pushedMainSha,
      changedFiles,
      updatedAt: new Date().toISOString(),
      lastError: null,
    });

    // Evidence-locked closure: post evidence BEFORE marking Done
    const detail = await findIssueByIdentifier(issueIdentifier);
    if (detail) {
      const evidenceComment = [
        `✅ **Integrated to main** — evidence record`,
        "",
        `| Field | Value |`,
        `|-------|-------|`,
        `| Issue | ${issueIdentifier} |`,
        `| Worktree | ${finalization.worktreeId || "unknown"} |`,
        `| Source commit | \`${headSha.slice(0, 8)}\` |`,
        `| Integration commit | \`${pushedMainSha.slice(0, 8)}\` |`,
        `| Branch | \`${branch}\` |`,
        `| Files changed | ${changedFiles.length} |`,
        `| Integration method | cherry-pick |`,
        `| Timestamp | ${new Date().toISOString()} |`,
        "",
        "### Changed files",
        ...changedFiles.slice(0, 20).map((f) => `- \`${f}\``),
        ...(changedFiles.length > 20
          ? [`- ... and ${changedFiles.length - 20} more`]
          : []),
        "",
        "### Diff summary",
        "```",
        diffStat || "(no diff stat)",
        "```",
      ].join("\n");

      // Post evidence FIRST — only close if evidence is published
      await addComment(detail.id, evidenceComment);
      await updateIssue(detail.id, { stateId: STATES.done });
    }

    dequeueIntegrationCandidate(issueIdentifier);
    return { ok: true, mainSha: pushedMainSha };
  } catch (err) {
    logError(`[integrator] Unexpected error for ${issueIdentifier}: ${err.message}`);

    // Return to main branch
    try {
      git("checkout", "main");
    } catch {
      /* best effort */
    }

    // Mark as repairable on infra failure
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
