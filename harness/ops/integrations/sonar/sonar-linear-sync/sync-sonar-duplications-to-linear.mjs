import { createIssue, STATES } from "../../linear/linear-client.mjs";

import { applyPromoteAndRequeue } from "./apply-promote-and-requeue.mjs";
import { buildDuplicationLinearDescription } from "./build-duplication-linear-description.mjs";
import { buildDuplicationLinearTitle } from "./build-duplication-linear-title.mjs";
import { extractSonarKey } from "./extract-sonar-key.mjs";
import { findOpenLinearIssuesByTag } from "./find-open-linear-issues-by-tag.mjs";
import { resolveStaleLinearIssues } from "./resolve-stale-linear-issues.mjs";
import { logInfo } from "./logger.mjs";

export async function syncSonarDuplicationsToLinear({
  sonarDupIssues,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[SonarDup]");

  const keyToLinear = new Map();
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk && sk.startsWith("dup-")) {
      keyToLinear.set(sk.replace("dup-", ""), li);
    }
  }

  const currentKeys = new Set(sonarDupIssues.map((i) => i.key));

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];

  for (const sd of sonarDupIssues) {
    if (keyToLinear.has(sd.key)) {
      const existing = keyToLinear.get(sd.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-dup-sync",
        "duplication issue",
      );
      if (actions.promoted) {
        promoted.push({ duplication: sd, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ duplication: sd, linear: existing });
      }
      continue;
    }

    const title = buildDuplicationLinearTitle(sd, projectKey);
    const description = buildDuplicationLinearDescription(sd, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ duplication: sd, linear: issue });
    logInfo(`[sonar-dup-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-dup-sync", "Duplication")
    : [];

  return { created, skipped, promoted, requeued, resolved };
}
