#!/usr/bin/env node

/**
 * github-linear-sync-audit.mjs — Audit GitHub issues against Linear
 * 
 * Identifies GitHub issues that are no longer linked to active Linear issues.
 * 
 * Usage:
 *   GITHUB_TOKEN=... LINEAR_API_KEY=... node scripts/ops/integrations/linear/github-linear-sync-audit.mjs
 *   GITHUB_TOKEN=... LINEAR_API_KEY=... node scripts/ops/integrations/linear/github-linear-sync-audit.mjs --close-orphans
 */

import { createLogger } from "../../lib/logger.mjs";
import { listIssuesByState } from "../linear/linear-client.mjs";

const { logInfo, logError, logWarn, logDebug } = createLogger();

const GITHUB_API = "https://api.github.com";
const GITHUB_REPO = process.env.GITHUB_REPO || "maldous/anqr"; // Update if needed
const REQUEST_TIMEOUT_MS = 20_000;

function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN environment variable is not set");
  return token;
}

async function fetchGitHubIssues(state = "open") {
  const token = getGitHubToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const issues = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${GITHUB_API}/repos/${GITHUB_REPO}/issues?state=${state}&per_page=100&page=${page}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      // Filter out pull requests (they show up in the issues API)
      const actualIssues = data.filter(issue => !issue.pull_request);
      issues.push(...actualIssues);

      hasMore = data.length === 100;
      page++;
    }

    return issues;
  } finally {
    clearTimeout(timer);
  }
}

async function closeGitHubIssue(issueNumber, reason) {
  const token = getGitHubToken();
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/issues/${issueNumber}`;
  
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: "closed",
      state_reason: "not_planned",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to close issue #${issueNumber}: ${res.status} ${res.statusText}`);
  }

  // Add a comment explaining why it was closed
  const commentUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`;
  await fetch(commentUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: `Closed automatically: ${reason}\n\n**GitHub Issues are disabled for this repository.** All issue tracking is managed through [Linear](https://linear.app).`,
    }),
  });

  return res.json();
}

function extractLinearIdentifier(issue) {
  // Look for Linear identifier patterns in the issue body or title
  // Common patterns: ANQR-123, [ANQR-123], Linear: ANQR-123, etc.
  const text = `${issue.title} ${issue.body || ""}`;
  const patterns = [
    /\b([A-Z]{2,}-\d+)\b/g, // ANQR-123
    /Linear[:\s]+([A-Z]{2,}-\d+)/gi, // Linear: ANQR-123
    /\[([A-Z]{2,}-\d+)\]/g, // [ANQR-123]
  ];

  const matches = new Set();
  for (const pattern of patterns) {
    const found = text.matchAll(pattern);
    for (const match of found) {
      matches.add(match[1].toUpperCase());
    }
  }

  return Array.from(matches);
}

async function auditSync(closeOrphans = false) {
  logInfo("[github-linear-sync-audit] Starting audit\n");

  // Fetch GitHub issues
  logInfo("📥 Fetching GitHub issues...");
  const githubIssues = await fetchGitHubIssues("open");
  logInfo(`Found ${githubIssues.length} open GitHub issues\n`);

  // Fetch Linear issues (all states)
  logInfo("📥 Fetching Linear issues...");
  const allStates = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review", "Done", "Canceled"];
  const linearIssues = await listIssuesByState(allStates);
  logInfo(`Found ${linearIssues.length} Linear issues (all states)\n`);

  // Build Linear identifier map
  const linearIdentifiers = new Set(linearIssues.map(i => i.identifier));
  logDebug(`Linear identifiers: ${Array.from(linearIdentifiers).slice(0, 10).join(", ")}...\n`);

  // Analyze GitHub issues
  const orphanedIssues = [];
  const linkedIssues = [];
  const ambiguousIssues = [];

  for (const ghIssue of githubIssues) {
    const linkedIds = extractLinearIdentifier(ghIssue);

    if (linkedIds.length === 0) {
      // No Linear reference found
      orphanedIssues.push({
        number: ghIssue.number,
        title: ghIssue.title,
        url: ghIssue.html_url,
        created_at: ghIssue.created_at,
        updated_at: ghIssue.updated_at,
        reason: "No Linear identifier found",
      });
    } else if (linkedIds.length === 1) {
      const linkedId = linkedIds[0];
      const existsInLinear = linearIdentifiers.has(linkedId);

      if (existsInLinear) {
        linkedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          linearId: linkedId,
        });
      } else {
        orphanedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          url: ghIssue.html_url,
          created_at: ghIssue.created_at,
          updated_at: ghIssue.updated_at,
          reason: `Linear issue ${linkedId} not found (deleted or canceled)`,
          linkedId,
        });
      }
    } else {
      // Multiple Linear IDs found
      const activeIds = linkedIds.filter(id => linearIdentifiers.has(id));
      
      if (activeIds.length === 0) {
        orphanedIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          url: ghIssue.html_url,
          created_at: ghIssue.created_at,
          updated_at: ghIssue.updated_at,
          reason: `Multiple Linear IDs found but none active: ${linkedIds.join(", ")}`,
          linkedIds,
        });
      } else {
        ambiguousIssues.push({
          number: ghIssue.number,
          title: ghIssue.title,
          linkedIds,
          activeIds,
        });
      }
    }
  }

  // Report findings
  logInfo("=" .repeat(80));
  logInfo("AUDIT RESULTS");
  logInfo("=" .repeat(80) + "\n");

  logInfo(`✅ Linked issues: ${linkedIssues.length}`);
  logInfo(`❌ Orphaned issues: ${orphanedIssues.length}`);
  logInfo(`⚠️  Ambiguous issues: ${ambiguousIssues.length}\n`);

  if (orphanedIssues.length > 0) {
    logWarn("=" .repeat(80));
    logWarn("ORPHANED GITHUB ISSUES (not linked to active Linear issues)");
    logWarn("=" .repeat(80) + "\n");

    for (const issue of orphanedIssues) {
      logWarn(`#${issue.number}: ${issue.title}`);
      logWarn(`  URL: ${issue.url}`);
      logWarn(`  Reason: ${issue.reason}`);
      logWarn(`  Created: ${issue.created_at}`);
      logWarn(`  Updated: ${issue.updated_at}\n`);
    }
  }

  if (ambiguousIssues.length > 0) {
    logInfo("=" .repeat(80));
    logInfo("AMBIGUOUS GITHUB ISSUES (multiple Linear references)");
    logInfo("=" .repeat(80) + "\n");

    for (const issue of ambiguousIssues) {
      logInfo(`#${issue.number}: ${issue.title}`);
      logInfo(`  Linked IDs: ${issue.linkedIds.join(", ")}`);
      logInfo(`  Active IDs: ${issue.activeIds.join(", ")}\n`);
    }
  }

  if (closeOrphans && orphanedIssues.length > 0) {
    logWarn(`\n🔒 Closing ${orphanedIssues.length} orphaned issues...\n`);
    
    let closedCount = 0;
    let failedCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < orphanedIssues.length; i += batchSize) {
      const batch = orphanedIssues.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(issue => closeGitHubIssue(issue.number, issue.reason))
      );
      
      for (let j = 0; j < results.length; j++) {
        const issue = batch[j];
        if (results[j].status === "fulfilled") {
          closedCount++;
          if (closedCount % 50 === 0) {
            logInfo(`Progress: ${closedCount}/${orphanedIssues.length} closed`);
          }
        } else {
          failedCount++;
          logError(`❌ Failed to close #${issue.number}: ${results[j].reason.message}`);
        }
      }
      
      // Rate limit: wait 500ms between batches
      if (i + batchSize < orphanedIssues.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    logInfo(`\n📊 Closed ${closedCount} issues, ${failedCount} failed\n`);
  }

  // Summary
  logInfo("=" .repeat(80));
  logInfo("SUMMARY");
  logInfo("=" .repeat(80));
  logInfo(`Total GitHub issues: ${githubIssues.length}`);
  logInfo(`Properly linked: ${linkedIssues.length} (${((linkedIssues.length / githubIssues.length) * 100).toFixed(1)}%)`);
  logInfo(`Orphaned: ${orphanedIssues.length} (${((orphanedIssues.length / githubIssues.length) * 100).toFixed(1)}%)`);
  logInfo(`Ambiguous: ${ambiguousIssues.length} (${((ambiguousIssues.length / githubIssues.length) * 100).toFixed(1)}%)`);

  return {
    total: githubIssues.length,
    linked: linkedIssues,
    orphaned: orphanedIssues,
    ambiguous: ambiguousIssues,
  };
}

async function main() {
  const closeOrphans = process.argv.includes("--close-orphans");

  try {
    await auditSync(closeOrphans);
    process.exit(0);
  } catch (error) {
    logError(`[github-linear-sync-audit] Error: ${error.message}`);
    if (error.stack) {
      logDebug(error.stack);
    }
    process.exit(1);
  }
}

await main();
