// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:283

import { createIssue, updateIssue, addComment, STATES } from "../../linear/linear-client.mjs";

import { applyPromoteAndRequeue } from "./apply-promote-and-requeue.mjs";
import { buildLinearDescription } from "./build-linear-description.mjs";
import { buildLinearTitle } from "./build-linear-title.mjs";
import { extractSonarKey } from "./extract-sonar-key.mjs";
import { findOpenLinearIssuesByTag } from "./find-open-linear-issues-by-tag.mjs";
import { resolveStaleLinearIssues } from "./resolve-stale-linear-issues.mjs";
import { logInfo } from "./logger.mjs";

export async function syncSonarToLinear({
  sonarIssues,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[Sonar]");

  const keyToLinear = new Map();
  const legacyIssues = [];
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk) {
      keyToLinear.set(sk, li);
    } else {
      legacyIssues.push(li);
    }
  }

  const currentKeys = new Set(sonarIssues.map((i) => i.key));

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];
  for (const si of sonarIssues) {
    if (keyToLinear.has(si.key)) {
      const existing = keyToLinear.get(si.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-sync",
        "sonar finding",
      );
      if (actions.promoted) {
        promoted.push({ sonar: si, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ sonar: si, linear: existing });
      }
      continue;
    }

    const title = buildLinearTitle(si, projectKey);
    const description = buildLinearDescription(si, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ sonar: si, linear: issue });
    logInfo(`[sonar-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-sync", "Sonar finding")
    : [];

  if (resolveStale) {
    for (const linearIssue of legacyIssues) {
      logInfo(`[sonar-sync] Resolving legacy issue ${linearIssue.identifier}`);
      await addComment(
        linearIssue.id,
        [
          `\u2705 **Replaced by per-finding issues** — ${new Date().toISOString().slice(0, 10)}`,
          "",
          "Sonar issues are now tracked individually. This aggregate issue is no longer needed.",
        ].join("\n"),
      );
      await updateIssue(linearIssue.id, { stateId: STATES.done });
      resolved.push(linearIssue);
    }
  }

  return { created, skipped, promoted, requeued, resolved };
}
