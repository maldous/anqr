// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:412

import { createIssue, STATES } from "../../linear/linear-client.mjs";

import { applyPromoteAndRequeue } from "./apply-promote-and-requeue.mjs";
import { buildHotspotLinearDescription } from "./build-hotspot-linear-description.mjs";
import { buildHotspotLinearTitle } from "./build-hotspot-linear-title.mjs";
import { extractSonarKey } from "./extract-sonar-key.mjs";
import { findOpenLinearIssuesByTag } from "./find-open-linear-issues-by-tag.mjs";
import { resolveStaleLinearIssues } from "./resolve-stale-linear-issues.mjs";
import { logInfo } from "./logger.mjs";

export async function syncSonarHotspotsToLinear({
  sonarHotspots,
  projectKey,
  sonarHost,
  priority,
  resolveStale,
  requeueToReady,
}) {
  const existingLinear = await findOpenLinearIssuesByTag("[SonarHotspot]");

  const keyToLinear = new Map();
  for (const li of existingLinear) {
    const sk = extractSonarKey(li.description);
    if (sk && sk.startsWith("hotspot-")) {
      keyToLinear.set(sk.replace("hotspot-", ""), li);
    }
  }

  const currentKeys = new Set(sonarHotspots.map((h) => h.key));

  const created = [];
  const skipped = [];
  const promoted = [];
  const requeued = [];

  for (const sh of sonarHotspots) {
    if (keyToLinear.has(sh.key)) {
      const existing = keyToLinear.get(sh.key);
      const actions = await applyPromoteAndRequeue(
        existing,
        priority,
        requeueToReady,
        "sonar-hotspot-sync",
        "security hotspot",
      );
      if (actions.promoted) {
        promoted.push({ hotspot: sh, linear: existing, ...actions.promoted });
      }
      if (actions.requeued) {
        requeued.push({ linear: existing, ...actions.requeued });
      }
      if (!actions.promoted && !actions.requeued) {
        skipped.push({ hotspot: sh, linear: existing });
      }
      continue;
    }

    const title = buildHotspotLinearTitle(sh, projectKey);
    const description = buildHotspotLinearDescription(sh, projectKey, sonarHost);
    const issue = await createIssue({ title, description, priority, stateId: STATES.todo });
    created.push({ hotspot: sh, linear: issue });
    logInfo(`[sonar-hotspot-sync] Created ${issue.identifier}: ${title}`);
  }

  const resolved = resolveStale
    ? await resolveStaleLinearIssues(keyToLinear, currentKeys, "sonar-hotspot-sync", "Hotspot")
    : [];

  return { created, skipped, promoted, requeued, resolved };
}
