import {
  dequeueIntegrationCandidate,
  getFinalizationState,
  setFinalizationState,
  getIssueState,
} from "../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../linear-client.mjs";
import { recordIntegrationResult, loadEvidenceRecord } from "../../core/task-evidence.mjs";

import { findIssueByIdentifier } from "./find-issue-by-identifier.mjs";
import { git } from "./git.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

function buildEvidenceComment({
  issueIdentifier,
  finalization,
  pushedMainSha,
  changedFiles,
  diffStat,
  evidence,
}) {
  const validation = evidence?.validation || null;
  const push = evidence?.push || null;
  const docsUpdated = changedFiles.some((f) => /(^docs\/)|README\.md$/.test(f));
  const verificationResults = [
    ["typecheck", validation?.typecheckPassed],
    ["tests", validation?.testsPassed],
    ["lint", validation?.lintPassed],
  ];

  return [
    `✅ **Integrated to main** — evidence record`,
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Issue | ${issueIdentifier} |`,
    `| Worktree | ${finalization.worktreeId || evidence?.worktreeSelection?.worktreeId || "unknown"} |`,
    `| Actor | symphony-integrator |`,
    `| Source commit | \`${(finalization.headSha || "unknown").slice(0, 8)}\` |`,
    `| Integration commit | \`${pushedMainSha.slice(0, 8)}\` |`,
    `| Branch | \`${finalization.branch || "unknown"}\` |`,
    `| Files changed | ${changedFiles.length} |`,
    `| Docs updated | ${docsUpdated ? "yes" : "no"} |`,
    `| Push status | ${push?.success === true ? "passed" : push?.success === false ? "failed" : "unknown"} |`,
    `| Integration method | cherry-pick |`,
    `| Timestamp | ${new Date().toISOString()} |`,
    "",
    `### Verification commands run`,
    `- npm run typecheck`,
    `- npm run test`,
    `- npm run lint`,
    "",
    `### Verification results`,
    ...verificationResults.map(
      ([name, value]) =>
        `- ${name}: ${value === true ? "passed" : value === false ? "failed" : "skipped or not recorded"}`,
    ),
    validation?.errors?.length
      ? `- errors: ${validation.errors.join(", ")}`
      : `- errors: none recorded`,
    "",
    `### Changed files`,
    ...changedFiles.slice(0, 20).map((f) => `- \`${f}\``),
    ...(changedFiles.length > 20 ? [`- ... and ${changedFiles.length - 20} more`] : []),
    "",
    `### Diff summary`,
    "```",
    diffStat || "(no diff stat)",
    "```",
  ].join("\n");
}

async function publishEvidenceAndClose({
  issueIdentifier,
  finalization,
  pushedMainSha,
  changedFiles,
  diffStat,
}) {
  const detail = await findIssueByIdentifier(issueIdentifier);
  if (!detail) {
    await setFinalizationState(issueIdentifier, {
      state: "evidence_pending_closeout",
      integratedMainSha: pushedMainSha,
      changedFiles,
      diffStat,
      lastError: "Linear issue detail unavailable during closeout",
      updatedAt: new Date().toISOString(),
    });
    return { ok: false, reason: "missing_linear_detail" };
  }

  const evidence = finalization.correlationId ? loadEvidenceRecord(finalization.correlationId) : null;
  const evidenceComment = buildEvidenceComment({
    issueIdentifier,
    finalization,
    pushedMainSha,
    changedFiles,
    diffStat,
    evidence,
  });

  await addComment(detail.id, evidenceComment);
  await updateIssue(detail.id, { stateId: STATES.done });
  return { ok: true };
}

export async function integrateCandidate(issueIdentifier) {
  const finalization = getFinalizationState(issueIdentifier);
  if (!finalization || !["integration_pending", "evidence_pending_closeout"].includes(finalization.state)) {
    logWarn(`[integrator] ${issueIdentifier}: unexpected finalization state: ${finalization?.state}`);
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

  logInfo(`[integrator] Integrating ${issueIdentifier}: branch=${branch} head=${headSha.slice(0, 8)}`);
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
    logInfo(`[integrator] ✅ ${issueIdentifier} integrated to main at ${pushedMainSha.slice(0, 8)} (${integrationMs}ms)`);

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
