// Generated from ../../../../scripts/ops/integrations/linear/incident-manager.mjs:77

import { findOpenIssuesByDescriptionFragment } from "../linear-client.mjs";

import { DEDUP_WINDOW_MS } from "./dedup-window-ms.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function findExistingIncident(fingerprint) {
  try {
    // Search for fingerprint marker in open incidents
    const openIssues = await findOpenIssuesByDescriptionFragment(
      `incident-fingerprint: ${fingerprint}`,
    );

    if (openIssues.length === 0) {
      return null;
    }

    // Check if any match is within the dedup window
    const now = Date.now();
    for (const issue of openIssues) {
      const issueAge = now - new Date(issue.createdAt).getTime();
      if (issueAge < DEDUP_WINDOW_MS) {
        logInfo(`[incident] Found existing incident within 24h: ${issue.identifier}`);
        return issue;
      }
    }

    return null;
  } catch (err) {
    logWarn(`[incident] Failed to search for existing incident: ${err.message}`);
    return null;
  }
}
