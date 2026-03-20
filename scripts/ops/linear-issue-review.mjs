#!/usr/bin/env node

/**
 * linear-issue-review.mjs — One-time review and correction of all open Linear issues
 *
 * Ensures all issues match the current hexagonal architecture with strict contracts.
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/linear-issue-review.mjs --dry-run
 *   LINEAR_API_KEY=... node scripts/ops/linear-issue-review.mjs
 */

const LINEAR_API = "https://api.linear.app/graphql";
const REQUEST_TIMEOUT_MS = 20_000;

const STATES = {
  backlog: "d9eeea8d-825b-4aa3-8429-75223a6b3624",
  todo: "ad8eea3e-7f5b-48dc-89c0-14506781a8c9",
  inProgress: "55a7c230-419f-4f42-95f7-84cf923a261d",
  inReview: "5e9dd779-e3dd-4743-a9c2-c588e67dd43e",
  done: "348275d1-b2a6-481d-81e0-cf2465cbfefd",
  canceled: "eb842399-5ae1-4fd2-a73e-e53801cfba56",
};

const TEAM_ID = "01534c1e-4041-474d-a81e-24f917f33912";

function getApiKey() {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("LINEAR_API_KEY not set");
  return key;
}

async function query(graphql, variables) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(LINEAR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getApiKey() },
      body: JSON.stringify({ query: graphql, variables }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.errors) throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
    return data.data;
  } finally {
    clearTimeout(timer);
  }
}

async function updateIssue(issueId, input) {
  const result = await query(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { id identifier title state { name } } }
    }`,
    { id: issueId, input },
  );
  if (!result.issueUpdate.success) throw new Error(`Failed to update ${issueId}`);
  return result.issueUpdate.issue;
}

async function addComment(issueId, body) {
  const result = await query(
    `mutation($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) { success }
    }`,
    { issueId, body },
  );
  if (!result.commentCreate.success) throw new Error(`Failed to comment on ${issueId}`);
}

async function listAllOpen() {
  const OPEN = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];
  const allNodes = [];
  let cursor = null;
  let hasMore = true;
  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes { id identifier title description state { name } labels { nodes { id name } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { filter: { team: { id: { eq: TEAM_ID } }, state: { name: { in: OPEN } } }, after: cursor },
    );
    allNodes.push(...result.issues.nodes);
    hasMore = result.issues.pageInfo.hasNextPage;
    cursor = result.issues.pageInfo.endCursor;
  }
  return allNodes;
}

// ---------------------------------------------------------------------------
// Classification data
// ---------------------------------------------------------------------------

const CLOSE_AS_DONE = {
  "ANQ-417": "src/modules/ no longer exists — all module directories dissolved into packages/.",
  "ANQ-415": "src/ layers fully dissolved into packages/ architecture. No cross-layer violations remain in old structure.",
  "ANQ-413": "src/ layers fully dissolved. Cross-layer audit is moot — architecture now enforced at packages/ level.",
  "ANQ-397": "src/components/sections/ no longer exists — dissolved into packages/.",
  "ANQ-396": "src/components/ no longer exists — dissolved into packages/.",
  "ANQ-395": "Service description already reads 'AI agent', not 'Ollama'. No update needed.",
  "ANQ-377": "Email infrastructure exists on main: email-ingest.mjs, notify.mjs, notify-impl.mjs, anqr-email-ingest.service/timer.",
  "ANQ-374": "Symphony execution agent implemented: symphony-agent.mjs, symphony-runner.mjs, symphony-credit-gate.mjs.",
  "ANQ-373": "Queue feeder operational: anqr-queue-feeder.service/timer, symphony-queue-control.mjs.",
  "ANQ-372": "Symphony autonomous operations running: all systemd services active, harness-report operational.",
  "ANQ-371": "harness-report.mjs implemented with quick/continuous/full profiles.",
  "ANQ-370": "Local execution path operational: litellm-config.yaml, model-injector-proxy.py, ollama-local-audit.mjs.",
  "ANQ-369": "Archived issue migration completed as part of foundation doctrine reboot.",
  "ANQ-368": "Symphony queue control implemented: symphony-queue-control.mjs, symphony-config.mjs with target_min/target_max.",
  "ANQ-367": "Scheduled operations operational: 4 systemd service/timer pairs (runner, nightly, queue-feeder, email-ingest).",
  "ANQ-366": "Guardian + Linear integration implemented: linear-client.mjs, linear-guardian.mjs, notify.mjs.",
  "ANQ-365": "Symphony bootstrap skeleton complete: all scripts/ops/ files exist on main.",
  "ANQ-364": "Symphony autonomous operations substrate fully bootstrapped on main.",
  "ANQ-363": "0 .type.ts files remain in src/ or packages/. All migrated to .types.ts.",
  "ANQ-361": "architecture-standards.md now documents full repo topology including apps/, packages/, netlify/, scripts/ops/, services/systemd/.",
  "ANQ-360": "src/app/ no longer exists — search-context dissolved with full src/ decomposition.",
  "ANQ-359": "src/data/ dissolved. src/types/ contains only .d.ts platform type augmentations — correct placement per architecture standards (tsconfig typeRoots).",
  "ANQ-358": "src/components/ no longer exists — dissolved into packages/.",
  "ANQ-357": "src/lib/ no longer exists — dissolved into packages/.",
  "ANQ-356": "src/hooks/ no longer exists — dissolved into packages/.",
  "ANQ-355": "All src/ cross-layer violations resolved via full decomposition into packages/.",
  "ANQ-354": "src/modules/ (542 files, 17 directories) fully dissolved into packages/domain/, packages/application/, etc.",
  "ANQ-353": "src/i18n/ resolved — dissolved with full src/ decomposition.",
  "ANQ-352": "CanvasFactory dependency inversion resolved via packages/domain/render/ extraction.",
  "ANQ-351": "src/store/ fully decomposed — types to domain, serializers to application, store to feature state.",
  "ANQ-320": "Linear guardian orchestration implemented: queue management, hygiene, stale escalation in linear-guardian.mjs.",
  "ANQ-319": "Model routing and provider fallback implemented via symphony-credit-gate.mjs provider cascade.",
};

const CLOSE_AS_CANCELED = {
  "ANQ-375": "Stale auto-created guardian issue from 2026-03-15. Lint state has changed since. If lint still fails, guardian will re-detect and create a fresh issue.",
};

const SCOPE_UPDATES = {
  "ANQ-376": {
    comment: "**Scope review (architecture alignment):** Verify against current symphony-runner.mjs — runner already uses 2-min timer with queue feeding. Update acceptance criteria to match current runner behavior and identify any remaining gap.",
  },
  "ANQ-362": {
    comment: "**Scope review (architecture alignment):** Updated target paths — colocated tests should be in `packages/domain/*/src/` and `packages/application/*/src/`, not the old `src/domain/` paths. Still 0 colocated .spec.ts files exist. vitest config exists at repo root.",
  },
  "ANQ-350": {
    comment: "**Scope review (architecture alignment):** linear-guardian.mjs now handles queue hygiene and stale escalation. Remaining scope: excessive failure comment cleanup, outdated metadata pruning, systemic failure pattern detection.",
  },
  "ANQ-349": {
    comment: "**Scope review (architecture alignment):** Label should be `harness` not `release`. Guardian already auto-creates issues for harness failures. Remaining scope: build/deployment failure auto-creation, monitoring alert integration, evidence attachment.",
  },
  "ANQ-348": {
    comment: "**Scope review (architecture alignment):** notify.mjs and email infrastructure exist. Guardian does stale escalation. Remaining scope: retry-limit alerts, persistent-failure escalation, pipeline-broken detection, latency alerts.",
  },
  "ANQ-347": {
    comment: "**Scope review (architecture alignment):** Credit gate blocks unauthorized cost. Guardian enforces queue limits. Remaining scope: unsafe deployment blocking, repeated-failure task blocking, policy violation logging and notification.",
  },
  "ANQ-345": {
    comment: "**Scope review (architecture alignment):** Credit gate has provider failover. Runner has timeout handling. Remaining scope: exponential backoff on task retry, auto-rollback on crash spike, failed service restart automation.",
  },
  "ANQ-323": {
    comment: "**Scope review (1.0 launch truth alignment):** 1.0 scope is web + netlify only. Narrow Sentry integration to: web, netlify functions, local-harness. Defer Android, iOS integration until mobile enters launch claim. Keep unified release ID and sourcemap requirements.",
  },
  "ANQ-322": {
    comment: "**Scope review (1.0 launch truth alignment):** Narrow runtime list for 1.0 to: web, netlify (not api/android/ios/worker). Keep: serviceName, serviceVersion, release, environment, traceId, spanId, sessionId, feature.",
  },
  "ANQ-321": {
    comment: "**Scope review (architecture alignment):** This is harness work, not governance. Label should be `harness`. Metrics targets still valid.",
  },
  "ANQ-318": {
    comment: "**Scope review (architecture alignment):** Runner has 120-min timeout. Guardian has stale-session detection. Remaining scope: sub-2-min failure detection, automatic recovery orchestration, dead service detection, retry queue overflow handling.",
  },
  "ANQ-317": {
    comment: "**Scope review (architecture alignment):** Runner already retries via credit gate provider cascade. Guardian escalates stale sessions. Remaining scope: explicit max-3-retry with exponential backoff per issue, retry queue depth monitoring, guardian critical-threshold intervention.",
  },
  "ANQ-315": {
    comment: "**Scope review (1.0 launch truth alignment):** Remove 'app store submission readiness (Android APK verified, iOS TestFlight accepted)' — not in 1.0 scope. 1.0 launch blockers are: web stability, netlify API stability, Sentry error rate, CI pipeline, monitoring, codebase maintainability gates.",
  },
  "ANQ-313": {
    comment: "**Scope review (1.0 launch truth alignment):** Remove 'Mobile memory ≤200MB' — mobile not in 1.0 scope. Keep web performance budgets: initial load, UI response, QR generation times. Add netlify function response time budget.",
  },
  "ANQ-311": {
    comment: "**Scope review (1.0 launch truth alignment):** Narrow from 'Web, Android, iOS, and API' to 'Web + Netlify API' for 1.0. Mobile parity deferred until mobile enters launch claim. Evidence: web and netlify API generate identical QR output.",
  },
  "ANQ-310": {
    comment: "**Scope review (1.0 launch truth alignment):** Scope to 1.0 surfaces: web, netlify, local-harness, git, CI. Defer Apple/AdMob credential review until mobile enters scope. Keep: secret scan, CI secret review, systemd/unit review, Netlify/Cloudflare review, Google/Sentry/GA credential review.",
  },
  "ANQ-306": {
    comment: "**Scope review (architecture alignment):** Update reference from 'tools/harness/*' to 'scripts/ops/*'. Current enforcement: .dependency-cruiser.cjs active, .dependency-cruiser.architecture.cjs active, .dependency-cruiser.contracts.cjs active, eslint-plugin-boundaries active. Architecture now enforced at packages/ level, not src/ layers.",
  },
  "ANQ-302": {
    comment: "**Scope review (1.0 launch truth alignment):** Web ads/analytics IS in 1.0 scope (packages/analytics/ exists). Only mobile ads deferred. Update description to clarify: web ads/analytics in scope, mobile ads NOT IN 1.0 SCOPE.",
  },
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const dryRun = process.argv.includes("--dry-run");
const stats = { done: 0, canceled: 0, updated: 0, skipped: 0, errors: 0 };

async function main() {
  console.log(`\n=== Linear Issue Review ${dryRun ? "(DRY RUN)" : ""} ===\n`);

  const issues = await listAllOpen();
  console.log(`Found ${issues.length} open issues\n`);

  const issueMap = new Map(issues.map((i) => [i.identifier, i]));

  // 1. Close completed issues as Done
  console.log("--- CLOSING COMPLETED ISSUES (Done) ---\n");
  for (const [identifier, evidence] of Object.entries(CLOSE_AS_DONE)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      console.log(`  ⚠️  ${identifier}: not found in open issues (may already be closed)`);
      stats.skipped++;
      continue;
    }
    const comment = `✅ **Closed by architecture review**\n\n${evidence}\n\n---\n*Closed by linear-issue-review.mjs — all issues reviewed against current hexagonal architecture with strict contracts.*`;
    if (dryRun) {
      console.log(`  🔲 ${identifier}: ${issue.title}`);
      console.log(`     → Would mark Done + comment: ${evidence.substring(0, 80)}...`);
    } else {
      try {
        await addComment(issue.id, comment);
        await updateIssue(issue.id, { stateId: STATES.done });
        console.log(`  ✅ ${identifier}: ${issue.title} → Done`);
      } catch (err) {
        console.error(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.done++;
  }

  // 2. Cancel stale issues
  console.log("\n--- CANCELING STALE ISSUES ---\n");
  for (const [identifier, reason] of Object.entries(CLOSE_AS_CANCELED)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      console.log(`  ⚠️  ${identifier}: not found`);
      stats.skipped++;
      continue;
    }
    const comment = `🚫 **Canceled by architecture review**\n\n${reason}\n\n---\n*Canceled by linear-issue-review.mjs*`;
    if (dryRun) {
      console.log(`  🔲 ${identifier}: ${issue.title}`);
      console.log(`     → Would cancel: ${reason.substring(0, 80)}...`);
    } else {
      try {
        await addComment(issue.id, comment);
        await updateIssue(issue.id, { stateId: STATES.canceled });
        console.log(`  🚫 ${identifier}: ${issue.title} → Canceled`);
      } catch (err) {
        console.error(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.canceled++;
  }

  // 3. Update issues with scope corrections
  console.log("\n--- UPDATING ISSUE SCOPE ---\n");
  for (const [identifier, update] of Object.entries(SCOPE_UPDATES)) {
    const issue = issueMap.get(identifier);
    if (!issue) {
      console.log(`  ⚠️  ${identifier}: not found`);
      stats.skipped++;
      continue;
    }
    if (dryRun) {
      console.log(`  🔲 ${identifier}: ${issue.title}`);
      console.log(`     → Would add scope review comment`);
    } else {
      try {
        await addComment(issue.id, update.comment + "\n\n---\n*Added by linear-issue-review.mjs*");
        console.log(`  📝 ${identifier}: ${issue.title} → Updated`);
      } catch (err) {
        console.error(`  ❌ ${identifier}: ${err.message}`);
        stats.errors++;
        continue;
      }
    }
    stats.updated++;
  }

  // Summary
  console.log("\n=== SUMMARY ===\n");
  console.log(`  Done:     ${stats.done}`);
  console.log(`  Canceled: ${stats.canceled}`);
  console.log(`  Updated:  ${stats.updated}`);
  console.log(`  Skipped:  ${stats.skipped}`);
  console.log(`  Errors:   ${stats.errors}`);
  console.log(`  Valid (no changes): ${issues.length - stats.done - stats.canceled - stats.updated - stats.skipped}`);
  console.log(`\n  Total open issues processed: ${issues.length}`);
  if (dryRun) console.log("\n  ⚠️  DRY RUN — no changes were made\n");
}

await main();
