#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGql } from './lib/linear-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'linear-guardian');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'ANQ';
const CODEX_USER_NAME = process.env.LINEAR_CODEX_USER_NAME || 'Codex';
const REQUIRED_LABELS = (
  process.env.LINEAR_REQUIRED_LABELS ||
  'web,android,ios,api,ads,analytics,security,perf,reliability,p0,p1,payment,billing,paid'
)
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const SYMPHONY_DASHBOARD_URL = process.env.SYMPHONY_DASHBOARD_URL || 'http://127.0.0.1:4040';
const CANONICAL_SENTINEL_ID = process.env.CANONICAL_SENTINEL_ID || 'ANQ-105';
const GUARDIAN_SKIP_LEAD = process.env.GUARDIAN_SKIP_LEAD === '1';
const GUARDIAN_TASK_DESC_MAX = Number(process.env.GUARDIAN_TASK_DESC_MAX || 1200);
const GUARDIAN_TASK_CHECKLIST_MAX = Number(process.env.GUARDIAN_TASK_CHECKLIST_MAX || 1);
const HUMAN_REQUIRED_PATTERNS = [
  /\bcreate\b.{0,24}\b(api key|api token|credential|secret)\b/i,
  /\bmanual\b.{0,24}\b(step|action|intervention)\b/i,
  /\blog[ -]?in\b/i,
  /\bsign[ -]?in\b/i,
  /\bclick\b.{0,32}\b(button|settings|dashboard|portal|console)\b/i,
  /\bthird[- ]party website\b/i,
  /\bwithout api\b/i,
  /\bcaptcha\b/i,
  /\bpurchase\b.{0,24}\b(credit|subscription|plan)\b/i,
];

const APPLY = process.argv.includes('--apply');

const gql = createGql(LINEAR_API_KEY);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function countUncheckedChecklistItems(text) {
  if (!text) return 0;
  const matches = text.match(/^\s*[-*]\s+\[\s\]\s+/gm);
  return matches ? matches.length : 0;
}

function compactText(text, maxChars) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, Math.max(0, maxChars - 1))}\u2026`;
}

function oneTaskBudget() {
  return { profile: 'always-small', maxDescriptionChars: GUARDIAN_TASK_DESC_MAX };
}

function isHumanOnlyIssue(issue) {
  const text = `${issue.title || ''}\n${issue.description || ''}`;
  return HUMAN_REQUIRED_PATTERNS.some((re) => re.test(text));
}

function normalizeDescriptorTitle(title, desiredPrefix) {
  const trimmed = (title || '').trim();
  if (!desiredPrefix || !trimmed) return trimmed;
  if (trimmed.startsWith(`${desiredPrefix} `) || trimmed === desiredPrefix) return trimmed;
  if (/^\[[^\]]+\]\s+/.test(trimmed)) {
    return trimmed.replace(/^\[[^\]]+\]\s+/, `${desiredPrefix} `);
  }
  return `${desiredPrefix} ${trimmed}`;
}

function desiredDescriptor(issue) {
  const title = issue.title || '';
  const description = issue.description || '';
  if (title.startsWith('[SENTINEL]')) return '[SENTINEL]';
  if (isHumanOnlyIssue(issue)) return '[HUMAN]';
  if (/\bpart of anq-\d+\b/i.test(description)) return '[CHILD]';
  return null;
}

function extractValidationHint(description) {
  if (!description) return 'Run the smallest deterministic validation command that covers the change.';
  const lines = description.split('\n');
  const validationLine = lines.find((line) => /validation|test/i.test(line));
  if (validationLine) return compactText(validationLine, 220);
  const commandMatch = description.match(/`([^`\n]{3,180})`/);
  if (commandMatch) return `Validation hint from parent: \`${commandMatch[1]}\``;
  return 'Run the smallest deterministic validation command that covers the change.';
}

function pendingInstructionComment(issue) {
  const validationHint = extractValidationHint(issue.description || '');
  return [
    'Moved to `Pending` because this task appears to require guaranteed human-only actions.',
    '',
    'Required human steps:',
    '1. Obtain/perform the needed external action manually (account login, portal click-through, or credential generation).',
    '2. Add the exact values/artifacts/URLs needed by automation to continue.',
    '3. Re-open this issue to `Backlog` once prerequisites are ready.',
    '',
    'Required tests to attach when unblocked:',
    `1. ${validationHint}`,
    '2. Include concrete pass/fail output in the issue comment.',
  ].join('\n');
}

function buildLocalSliceDescription(issue, maxDescriptionChars) {
  const description = issue.description || '';
  const checklistMatch = description.match(/^\s*[-*]\s+\[\s\]\s+(.+)$/m);
  const firstStep = checklistMatch ? checklistMatch[1].trim() : '';
  const compact = compactText(description, Math.min(900, maxDescriptionChars));

  const lines = [
    `Parent issue: ${issue.identifier}`,
    `Parent title: ${issue.title}`,
    '',
    'Child task slice. Keep this issue to one simple, atomic change.',
    'Do exactly one atomic change and validate it.',
  ];
  if (firstStep) {
    lines.push('', `Primary step: ${firstStep}`);
  } else if (compact) {
    lines.push('', `Parent summary: ${compact}`);
  }
  lines.push(
    '',
    `Validation requirement: ${extractValidationHint(description)}`,
    'When complete: post a short comment on the parent issue with what was done and what remains.',
  );
  return lines.join('\n');
}

async function checkSymphonyCreditStatus() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(SYMPHONY_DASHBOARD_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await res.text();

    const hasCreditsMatch = html.match(/&quot;has_credits&quot;\s*=&gt;\s*(true|false)/);
    const balanceMatch = html.match(/&quot;balance&quot;\s*=&gt;\s*&quot;(\d+)&quot;/);

    const hasCredits = hasCreditsMatch ? hasCreditsMatch[1] === 'true' : null;
    const balance = balanceMatch ? Number(balanceMatch[1]) : null;

    return { reachable: true, hasCredits, balance };
  } catch {
    return { reachable: false, hasCredits: null, balance: null };
  }
}

async function getSymphonyRunningIssueIds() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(SYMPHONY_DASHBOARD_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await res.text();
    const start = html.indexOf('Running sessions');
    const end = html.indexOf('Retry queue');
    if (start === -1 || end === -1 || end <= start) return [];
    const runningSection = html.slice(start, end);
    const ids = new Set();
    const re = /<span class="issue-id">([^<]+)<\/span>/g;
    let match;
    while ((match = re.exec(runningSection)) !== null) {
      const id = String(match[1] || '').trim();
      if (id) ids.add(id);
    }
    return [...ids];
  } catch {
    return [];
  }
}

async function main() {
  const startedAt = new Date().toISOString();

  const creditStatus = await checkSymphonyCreditStatus();
  const runningIssueIds = await getSymphonyRunningIssueIds();
  let skipLead = GUARDIAN_SKIP_LEAD;
  let leadSkipReason = GUARDIAN_SKIP_LEAD ? 'GUARDIAN_SKIP_LEAD=1' : null;

  if (!skipLead && creditStatus.reachable && creditStatus.hasCredits === false) {
    skipLead = true;
    leadSkipReason = `Codex credits exhausted (balance=${creditStatus.balance})`;
  }

  if (skipLead) {
    console.error(`Lead enforcement skipped: ${leadSkipReason}`);
  }

  const summary = {
    startedAt,
    teamKey: TEAM_KEY,
    codexUser: CODEX_USER_NAME,
    apply: APPLY,
    creditStatus,
    runningIssueIds,
    skipLead,
    leadSkipReason,
    updates: [],
    missingLabels: [],
    createdLabels: [],
    skippedProjects: [],
    unchangedProjects: [],
  };

  const teamData = await gql(
    `query TeamSnapshot($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 1) {
        nodes {
          id
          key
          name
          members(first: 100) { nodes { id name active } }
          projects(first: 100) { nodes { id name lead { id name } } }
          labels(first: 200) { nodes { id name } }
        }
      }
    }`,
    { key: TEAM_KEY }
  );

  const team = teamData.teams.nodes[0];
  if (!team) {
    throw new Error(`Team ${TEAM_KEY} not found`);
  }

  const existingLabels = new Set(team.labels.nodes.map((l) => l.name.toLowerCase()));
  const labelByName = new Map(team.labels.nodes.map((l) => [l.name.toLowerCase(), l]));
  for (const name of REQUIRED_LABELS) {
    if (!existingLabels.has(name.toLowerCase())) {
      summary.missingLabels.push(name);
      if (APPLY) {
        await gql(
          `mutation LabelCreate($input: IssueLabelCreateInput!) {
            issueLabelCreate(input: $input) { success issueLabel { id name } }
          }`,
          { input: { teamId: team.id, name } }
        );
        summary.createdLabels.push(name);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Label hygiene: keep state/priority semantic labels aligned with issue data.
  // - Remove p0/p1 from non-matching priorities
  // - Add p0 for priority=1 and p1 for priority=2
  // - Remove Finished label from non-Done issues
  // -----------------------------------------------------------------------
  summary.labelHygiene = { checked: false, updated: [] };
  const p0Label = labelByName.get('p0');
  const p1Label = labelByName.get('p1');
  const finishedLabel = labelByName.get('finished');
  const openIssuesForHygiene = await gql(
    `query {
      issues(
        filter: {
          team: { key: { eq: "ANQ" } },
          state: { name: { in: ["Backlog", "Todo", "In Progress", "Human Review", "Pending", "Rework", "In Review"] } }
        },
        first: 250
      ) {
        nodes {
          id
          identifier
          title
          priority
          state { name }
          labels(first: 50) { nodes { id name } }
        }
      }
    }`
  );
  summary.labelHygiene.checked = true;

  for (const issue of openIssuesForHygiene.issues.nodes) {
    const currentLabelIds = issue.labels.nodes.map((l) => l.id);
    const nextLabelIds = [];
    for (const label of issue.labels.nodes) {
      const lower = label.name.toLowerCase();
      if (lower === 'p0' || lower === 'p1') continue;
      if (lower === 'finished' && issue.state.name !== 'Done') continue;
      nextLabelIds.push(label.id);
    }
    if (issue.priority === 1 && p0Label) nextLabelIds.push(p0Label.id);
    if (issue.priority === 2 && p1Label) nextLabelIds.push(p1Label.id);

    const nextUniqueSorted = [...new Set(nextLabelIds)].sort();
    const currentSorted = [...currentLabelIds].sort();
    const changed = JSON.stringify(nextUniqueSorted) !== JSON.stringify(currentSorted);
    if (!changed) continue;

    const update = {
      identifier: issue.identifier,
      state: issue.state.name,
      priority: issue.priority,
      updated: false,
    };
    if (APPLY) {
      await gql(
        `mutation($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) { success }
        }`,
        { id: issue.id, input: { labelIds: nextUniqueSorted } }
      );
      update.updated = true;
    }
    summary.labelHygiene.updated.push(update);
  }

  // -----------------------------------------------------------------------
  // Priority backfill: no open issue may have missing priority (0).
  // -----------------------------------------------------------------------
  summary.priorityBackfill = { checked: false, updated: [] };
  const openIssuesForPriority = await gql(
    `query {
      issues(
        filter: {
          team: { key: { eq: "ANQ" } },
          state: { name: { in: ["Backlog", "Todo", "In Progress", "Pending", "Human Review", "Rework", "In Review"] } },
          priority: { eq: 0 }
        },
        first: 250
      ) {
        nodes { id identifier title state { name } priority }
      }
    }`
  );
  summary.priorityBackfill.checked = true;
  for (const issue of openIssuesForPriority.issues.nodes) {
    let targetPriority = 3; // default medium
    if (issue.title.startsWith('[SENTINEL]')) {
      targetPriority = 1;
    } else if (/\burgent\b/i.test(issue.title)) {
      targetPriority = 2;
    } else if (issue.title.startsWith('[PARENT]')) {
      targetPriority = 2;
    }
    const update = {
      identifier: issue.identifier,
      fromPriority: issue.priority,
      toPriority: targetPriority,
      updated: false,
    };
    if (APPLY) {
      await gql(
        `mutation($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) { success }
        }`,
        { id: issue.id, input: { priority: targetPriority } }
      );
      update.updated = true;
    }
    summary.priorityBackfill.updated.push(update);
  }

  // -----------------------------------------------------------------------
  // Sentinel priority invariant: only [SENTINEL] issues may be P0 (priority=1).
  // -----------------------------------------------------------------------
  summary.sentinelPrioritySync = { checked: false, updated: [] };
  const p0Issues = await gql(
    `query {
      issues(filter: { team: { key: { eq: "ANQ" } }, priority: { eq: 1 } }, first: 250) {
        nodes { id identifier title state { name } priority }
      }
    }`
  );
  summary.sentinelPrioritySync.checked = true;
  for (const issue of p0Issues.issues.nodes) {
    if (issue.title.startsWith('[SENTINEL]')) continue;
    const update = {
      identifier: issue.identifier,
      fromPriority: issue.priority,
      toPriority: 2,
      updated: false,
    };
    if (APPLY) {
      await gql(
        `mutation($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) { success }
        }`,
        { id: issue.id, input: { priority: 2 } }
      );
      update.updated = true;
    }
    summary.sentinelPrioritySync.updated.push(update);
  }

  // -----------------------------------------------------------------------
  // Human-state invariant: all [HUMAN] issues must remain in Pending.
  // -----------------------------------------------------------------------
  summary.humanStateSync = { checked: false, pendingState: null, updated: [] };
  const statesForHuman = await gql(
    `query($teamId: ID!) {
      workflowStates(
        filter: { team: { id: { eq: $teamId } }, name: { in: ["Pending", "Human Review"] } }
        first: 10
      ) {
        nodes { id name }
      }
    }`,
    { teamId: team.id }
  );
  const pendingForHuman =
    statesForHuman.workflowStates.nodes.find((s) => s.name === 'Pending') ||
    statesForHuman.workflowStates.nodes.find((s) => s.name === 'Human Review') ||
    null;
  summary.humanStateSync.checked = true;
  summary.humanStateSync.pendingState = pendingForHuman?.name || null;
  if (pendingForHuman) {
    const humanIssues = await gql(
      `query {
        issues(
          filter: {
            team: { key: { eq: "ANQ" } },
            title: { startsWith: "[HUMAN]" },
            state: { name: { in: ["Backlog", "Todo", "In Progress", "Rework", "In Review", "Human Review", "Pending"] } }
          },
          first: 250
        ) {
          nodes { id identifier title state { name } }
        }
      }`
    );

    for (const issue of humanIssues.issues.nodes) {
      if (issue.state.name === pendingForHuman.name) continue;
      const update = {
        identifier: issue.identifier,
        from: issue.state.name,
        to: pendingForHuman.name,
        updated: false,
      };
      if (APPLY) {
        await gql(
          `mutation($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) { success }
          }`,
          { id: issue.id, input: { stateId: pendingForHuman.id } }
        );
        update.updated = true;
      }
      summary.humanStateSync.updated.push(update);
    }
  }

  // -----------------------------------------------------------------------
  // Priority/state hygiene: with max_concurrent_agents=2, keep In Progress
  // aligned to live Symphony running sessions while reserving one slot for
  // [SENTINEL]. If no live sessions exist, promote highest-priority work.
  // -----------------------------------------------------------------------
  summary.priorityStateSync = { checked: false, target: null, updates: [] };
  const symphonyProjectForSync = team.projects.nodes.find((p) => p.name === 'Symphony');
  if (symphonyProjectForSync) {
    const statesForSync = await gql(
      `query($teamId: ID!) {
        workflowStates(
          filter: { team: { id: { eq: $teamId } }, name: { in: ["Backlog", "In Progress"] } }
          first: 20
        ) {
          nodes { id name }
        }
      }`,
      { teamId: team.id }
    );
    const backlogState = statesForSync.workflowStates.nodes.find((s) => s.name === 'Backlog');
    const inProgressState = statesForSync.workflowStates.nodes.find(
      (s) => s.name === 'In Progress'
    );
    if (backlogState && inProgressState) {
      const symphonyOpen = await gql(
        `query($projectId: ID!) {
          issues(
            filter: {
              team: { key: { eq: "ANQ" } },
              project: { id: { eq: $projectId } },
              state: { name: { in: ["Backlog", "Todo", "In Progress", "Rework", "In Review"] } }
            },
            first: 200
          ) {
            nodes { id identifier title description priority state { name } }
          }
        }`,
        { projectId: symphonyProjectForSync.id }
      );

      const actionable = symphonyOpen.issues.nodes.filter(
        (i) => !isHumanOnlyIssue(i) && !i.title.startsWith('[HUMAN]')
      );
      actionable.sort((a, b) => a.priority - b.priority || a.identifier.localeCompare(b.identifier));
      const target = actionable[0] || null;
      summary.priorityStateSync.checked = true;
      summary.priorityStateSync.target = target ? target.identifier : null;

      if (target) {
        const byIdentifier = new Map(symphonyOpen.issues.nodes.map((i) => [i.identifier, i]));
        const runningSet = new Set(runningIssueIds);
        const sentinelIssue =
          actionable.find((i) => i.title.startsWith('[SENTINEL]') && i.state.name === 'In Progress') ||
          actionable.find((i) => i.title.startsWith('[SENTINEL]')) ||
          null;

        // Promote every live running issue to In Progress.
        for (const issueId of runningIssueIds) {
          const issue = byIdentifier.get(issueId);
          if (!issue) continue;
          if (issue.state.name === 'In Progress') continue;
          const update = {
            identifier: issue.identifier,
            from: issue.state.name,
            to: 'In Progress',
            reason: 'live-running-session',
            updated: false,
          };
          if (APPLY) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $id, input: $input) { success }
              }`,
              { id: issue.id, input: { stateId: inProgressState.id } }
            );
            update.updated = true;
          }
          summary.priorityStateSync.updates.push(update);
        }

        // Enforce concurrency=2: keep live-running sessions plus sentinel,
        // demote stale In Progress issues outside that allow-list.
        if (runningSet.size > 0) {
          const allowedInProgress = new Set(runningSet);
          if (sentinelIssue) allowedInProgress.add(sentinelIssue.identifier);
          for (const issue of actionable) {
            if (issue.state.name !== 'In Progress') continue;
            if (allowedInProgress.has(issue.identifier)) continue;
            const update = {
              identifier: issue.identifier,
              from: issue.state.name,
              to: 'Backlog',
              reason: 'stale-in-progress-not-running',
              updated: false,
            };
            if (APPLY) {
              await gql(
                `mutation($id: String!, $input: IssueUpdateInput!) {
                  issueUpdate(id: $id, input: $input) { success }
                }`,
                { id: issue.id, input: { stateId: backlogState.id } }
              );
              update.updated = true;
            }
            summary.priorityStateSync.updates.push(update);
          }
        } else if (target.state.name !== 'In Progress') {
          // Fallback when dashboard has no live running session.
          const update = {
            identifier: target.identifier,
            from: target.state.name,
            to: 'In Progress',
            reason: 'fallback-highest-priority',
            updated: false,
          };
          if (APPLY) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $id, input: $input) { success }
              }`,
              { id: target.id, input: { stateId: inProgressState.id } }
            );
            update.updated = true;
          }
          summary.priorityStateSync.updates.push(update);
        }
      }
    }
  }

  if (skipLead) {
    summary.skippedProjects = team.projects.nodes.map((p) => p.name);
  } else {
    const codex = team.members.nodes.find((m) => m.active && m.name === CODEX_USER_NAME);
    if (!codex) {
      throw new Error(`Active member '${CODEX_USER_NAME}' not found in team ${TEAM_KEY}`);
    }

    for (const project of team.projects.nodes) {
      const currentLeadId = project.lead?.id || null;
      if (currentLeadId === codex.id) {
        summary.unchangedProjects.push(project.name);
        continue;
      }

      const update = {
        projectId: project.id,
        projectName: project.name,
        fromLead: project.lead?.name || null,
        toLead: CODEX_USER_NAME,
        changed: false,
      };

      if (APPLY) {
        await gql(
          `mutation ProjectLeadUpdate($id: String!, $input: ProjectUpdateInput!) {
            projectUpdate(id: $id, input: $input) { success project { id name lead { id name } } }
          }`,
          { id: project.id, input: { leadId: codex.id } }
        );
        update.changed = true;
      }

      summary.updates.push(update);
    }
  }

  // -----------------------------------------------------------------------
  // Sentinel dead man's switch: ensure a [SENTINEL] issue always exists
  // in the Symphony project. If the sentinel fails before self-replicating,
  // this guarantees a new one is created within 15 minutes.
  // -----------------------------------------------------------------------
  const symphonyProject = team.projects.nodes.find((p) => p.name === 'Symphony');
  summary.sentinelCheck = {
    checked: false,
    exists: false,
    created: false,
    promotedToInProgress: false,
    canonical: CANONICAL_SENTINEL_ID,
    duplicatesCanceled: [],
  };

  if (symphonyProject) {
    const sentinelQuery = await gql(
      `query($projectId: ID!) {
        issues(filter: {
          team: { key: { eq: "ANQ" } },
          project: { id: { eq: $projectId } },
          title: { startsWith: "[SENTINEL]" },
          state: { name: { in: ["Backlog", "Todo", "In Progress", "Pending", "Human Review", "Rework", "In Review"] } }
        }, first: 25) {
          nodes { id identifier title state { name } }
        }
      }`,
      { projectId: symphonyProject.id }
    );

    summary.sentinelCheck.checked = true;
    const sentinelIssues = sentinelQuery.issues.nodes;
    const canonicalSentinel = sentinelIssues.find((i) => i.identifier === CANONICAL_SENTINEL_ID) || null;
    const chosenSentinel =
      canonicalSentinel ||
      sentinelIssues.slice().sort((a, b) => a.identifier.localeCompare(b.identifier))[0] ||
      null;
    const duplicateSentinels = chosenSentinel
      ? sentinelIssues.filter((i) => i.id !== chosenSentinel.id)
      : [];

    for (const dup of duplicateSentinels) {
      const archivedTitle = dup.title.startsWith('[SENTINEL]')
        ? dup.title.replace(/^\[SENTINEL\]\s*/, '[ARCHIVED] Duplicate sentinel: ')
        : `[ARCHIVED] Duplicate sentinel: ${dup.title || ''}`.trim();
      const update = {
        identifier: dup.identifier,
        from: dup.state?.name || null,
        to: 'Canceled',
        updated: false,
      };
      if (APPLY) {
        const cancelState = await gql(
          `query($teamId: ID!) {
            workflowStates(filter: { team: { id: { eq: $teamId } }, name: { eq: "Canceled" } }, first: 1) {
              nodes { id }
            }
          }`,
          { teamId: team.id }
        );
        const cancelStateId = cancelState.workflowStates.nodes[0]?.id;
        if (cancelStateId) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            { id: dup.id, input: { stateId: cancelStateId, title: archivedTitle } }
          );
          update.updated = true;
        }
      }
      summary.sentinelCheck.duplicatesCanceled.push(update);
    }

    const hasSentinel = Boolean(chosenSentinel);
    summary.sentinelCheck.exists = hasSentinel;

    if (!hasSentinel && APPLY) {
      const sentinelDescription =
        'Single-instance heartbeat. Do NOT create any new [SENTINEL] issues.\n\n' +
        '## Log Review & Self-Healing\n\n' +
        'Review recent Symphony logs for errors that need code fixes:\n' +
        '```bash\ngrep -aE "error|warning|Linear GraphQL request failed" ~/.local/state/symphony-anqr/log/log/symphony.log ~/.local/state/symphony-anqr/log/log/symphony.log.1 2>/dev/null | tail -200\n```\n\n' +
        'Before creating issues, query existing open issues in the Symphony project to avoid duplicates.\n\n' +
        'For each distinct error class requiring a code fix (skip transient/retryable errors):\n' +
        '1. Create a `[PARENT]` issue describing the error category.\n' +
        '2. Create `[CHILD]` issues for each specific atomic fix — each child description must contain exact file paths, exact code changes (before/after), and a validation command.\n' +
        '3. Link every `[CHILD]` to its `[PARENT]` using the `parentId` field in `issueCreate`.\n' +
        '4. Set explicit priority on every issue (2 = high, 3 = medium).\n' +
        '5. Place all issues in the Symphony project.\n\n' +
        'After log review and issue creation, move this sentinel issue to Backlog.\n\n' +
        'Do NOT create PRs, do NOT run paid actions.';

      const reliabilityLabel = team.labels.nodes.find(
        (l) => l.name.toLowerCase() === 'reliability'
      );

      await gql(
        `mutation($input: IssueCreateInput!) {
          issueCreate(input: $input) { success issue { identifier title } }
        }`,
        {
          input: {
            teamId: team.id,
            title: '[SENTINEL] Review progress, create issues, and continue',
            description: sentinelDescription,
            projectId: symphonyProject.id,
            priority: 1,
            ...(reliabilityLabel ? { labelIds: [reliabilityLabel.id] } : {}),
          },
        }
      );
      summary.sentinelCheck.created = true;
      console.error("Sentinel dead man's switch: created new sentinel issue");
    } else if (!hasSentinel) {
      console.error("Sentinel dead man's switch: no sentinel found (dry-run, would create)");
    }

    // Ensure sentinel always has a live slot: if no sentinel is In Progress,
    // promote a Backlog/Todo sentinel even when another issue is running.
    if (hasSentinel && chosenSentinel) {
      const sentinelInProgress = chosenSentinel.state?.name === 'In Progress';
      const sentinelBacklog =
        chosenSentinel.state?.name === 'Backlog' || chosenSentinel.state?.name === 'Todo'
          ? chosenSentinel
          : null;

      if (!sentinelInProgress && sentinelBacklog) {
        const workflowStates = await gql(
          `query($teamId: ID!) {
            workflowStates(filter: { team: { id: { eq: $teamId } }, name: { eq: "In Progress" } }, first: 1) {
              nodes { id name }
            }
          }`,
          { teamId: team.id }
        );
        const inProgressStateId = workflowStates.workflowStates.nodes[0]?.id;
        if (inProgressStateId) {
          if (APPLY) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $id, input: $input) { success }
              }`,
              { id: sentinelBacklog.id, input: { stateId: inProgressStateId } }
            );
          }
          summary.sentinelCheck.promotedToInProgress = true;
          console.error(
            `Sentinel dead man's switch: ${APPLY ? 'promoted' : 'would promote'} ${sentinelBacklog.identifier} to In Progress`
          );
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // Child-parent linkage audit: every [CHILD] issue must have a real parent.
  // -----------------------------------------------------------------------
  summary.childParentAudit = { checked: false, orphanCount: 0, orphans: [] };
  const childAudit = await gql(
    `query {
      issues(
        filter: {
          team: { key: { eq: "ANQ" } },
          title: { startsWith: "[CHILD]" },
          state: { name: { in: ["Backlog", "Todo", "In Progress", "Pending", "Human Review", "Rework", "In Review"] } }
        },
        first: 250
      ) {
        nodes { id identifier title parent { id identifier title } }
      }
    }`
  );
  summary.childParentAudit.checked = true;
  const orphanChildren = childAudit.issues.nodes.filter((i) => !i.parent);
  summary.childParentAudit.orphanCount = orphanChildren.length;
  summary.childParentAudit.orphans = orphanChildren.slice(0, 50).map((i) => ({
    identifier: i.identifier,
    title: i.title,
  }));
  if (orphanChildren.length > 0) {
    console.error(
      `Child-parent audit: found ${orphanChildren.length} open [CHILD] issues without parent linkage`
    );
  }

  // -----------------------------------------------------------------------
  // Auto-feed Symphony: keep 5-10 open issues in the Symphony project.
  // Moves highest-priority automatable issues from other projects.
  // This replaces the old sentinel-driven feeding (too complex for small models).
  // Wrapped in try/catch so a failure here doesn't break the entire guardian.
  // -----------------------------------------------------------------------
  summary.symphonyFeed = {
    checked: false,
    openCount: 0,
    moved: [],
    sliced: [],
    skippedOversized: [],
    pendingMoved: [],
  };

  try {
    if (symphonyProject) {
      const contextBudget = oneTaskBudget();
      summary.symphonyFeed.contextProfile = contextBudget.profile;
      summary.symphonyFeed.maxDescriptionChars = contextBudget.maxDescriptionChars;

      const pendingStates = await gql(
        `query($teamId: ID!) {
          workflowStates(
            filter: { team: { id: { eq: $teamId } }, name: { in: ["Pending", "Human Review"] } }
            first: 10
          ) {
            nodes { id name }
          }
        }`,
        { teamId: team.id }
      );
      const pendingState =
        pendingStates.workflowStates.nodes.find((s) => s.name === 'Pending') ||
        pendingStates.workflowStates.nodes.find((s) => s.name === 'Human Review') ||
        null;
      if (!pendingState) {
        summary.symphonyFeed.pendingStateMissing = true;
      }

      const symphonyIssues = await gql(
        `query($projectId: ID!) {
        issues(filter: {
          team: { key: { eq: "ANQ" } },
          project: { id: { eq: $projectId } },
          state: { name: { in: ["Backlog", "Todo", "In Progress"] } }
        }, first: 50) {
          nodes { id identifier title labels { nodes { name } } }
        }
      }`,
        { projectId: symphonyProject.id }
      );

      const openNonSentinel = symphonyIssues.issues.nodes.filter(
        (i) => !i.title.startsWith('[SENTINEL]')
      );
      summary.symphonyFeed.checked = true;
      summary.symphonyFeed.openCount = openNonSentinel.length;

      const TARGET_MIN = 5;
      const TARGET_MAX = 10;

      if (openNonSentinel.length < TARGET_MIN) {
        const needed = TARGET_MAX - openNonSentinel.length;

        const candidates = await gql(
          `query {
          issues(filter: {
            team: { key: { eq: "ANQ" } },
            state: { name: { in: ["Backlog", "Todo"] } }
          }, first: 100) {
            nodes {
              id
              identifier
              title
              description
              priority
              project { id name }
              labels { nodes { name } }
            }
          }
        }`
        );

        const HUMAN_LABELS = new Set(['payment', 'billing', 'paid']);
        const humanOnly = candidates.issues.nodes.filter((i) => isHumanOnlyIssue(i));
        for (const issue of humanOnly) {
          const entry = {
            identifier: issue.identifier,
            title: issue.title,
            toState: pendingState?.name || null,
            moved: false,
            commented: false,
          };
          if (APPLY && pendingState?.id) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $id, input: $input) { success }
              }`,
              { id: issue.id, input: { stateId: pendingState.id } }
            );
            entry.moved = true;
            await gql(
              `mutation($input: CommentCreateInput!) {
                commentCreate(input: $input) { success }
              }`,
              {
                input: {
                  issueId: issue.id,
                  body: pendingInstructionComment(issue),
                },
              }
            );
            entry.commented = true;
          }
          summary.symphonyFeed.pendingMoved.push(entry);
        }

        const movable = candidates.issues.nodes.filter((i) => {
          if (isHumanOnlyIssue(i)) return false;
          if (i.project?.id === symphonyProject.id) return false;
          if (i.title.startsWith('[SENTINEL]')) return false;
          if (i.title.startsWith('[PARENT]')) return false;
          const labelNames = i.labels.nodes.map((l) => l.name.toLowerCase());
          if (labelNames.some((l) => HUMAN_LABELS.has(l))) return false;
          return true;
        });

        const movableSmall = [];
        const movableOversized = [];
        for (const issue of movable) {
          const descriptionLen = (issue.description || '').trim().length;
          const checklistCount = countUncheckedChecklistItems(issue.description || '');
          const oversized =
            descriptionLen > contextBudget.maxDescriptionChars ||
            checklistCount > GUARDIAN_TASK_CHECKLIST_MAX;
          if (oversized) {
            movableOversized.push({ ...issue, descriptionLen, checklistCount });
          } else {
            movableSmall.push(issue);
          }
        }

        // Oldest-first tie-breaker ensures stable ordering for same-priority work.
        movableSmall.sort(
          (a, b) => a.priority - b.priority || a.identifier.localeCompare(b.identifier)
        );
        movableOversized.sort(
          (a, b) => a.priority - b.priority || a.identifier.localeCompare(b.identifier)
        );
        const toMove = movableSmall.slice(0, needed);
        const existingTitles = new Set(
          symphonyIssues.issues.nodes.map((i) => (i.title || '').toLowerCase())
        );

        for (const issue of toMove) {
          const entry = {
            identifier: issue.identifier,
            title: issue.title,
            fromProject: issue.project?.name || '(none)',
            moved: false,
          };

          if (APPLY) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
              { id: issue.id, input: { projectId: symphonyProject.id } }
            );
            entry.moved = true;
          }

          summary.symphonyFeed.moved.push(entry);
        }

        for (const issue of movableOversized.slice(0, 30)) {
          summary.symphonyFeed.skippedOversized.push({
            identifier: issue.identifier,
            title: issue.title,
            descriptionLen: issue.descriptionLen,
            checklistCount: issue.checklistCount,
          });
        }

        let remaining = needed - toMove.length;
        if (remaining > 0) {
          for (const issue of movableOversized) {
            if (remaining <= 0) break;
            const rawTitle = `[CHILD] ${issue.identifier}: ${issue.title}`;
            const sliceTitle =
              rawTitle.length > 140 ? `${rawTitle.slice(0, 139).trimEnd()}\u2026` : rawTitle;
            const titleKey = sliceTitle.toLowerCase();
            if (existingTitles.has(titleKey)) {
              continue;
            }

            const entry = {
              parentIdentifier: issue.identifier,
              parentTitle: issue.title,
              createdTitle: sliceTitle,
              created: false,
            };

            if (APPLY) {
              const sliceDescription = buildLocalSliceDescription(
                issue,
                contextBudget.maxDescriptionChars
              );
              await gql(
                `mutation($input: IssueCreateInput!) {
                  issueCreate(input: $input) { success issue { identifier title } }
                }`,
                {
                  input: {
                    teamId: team.id,
                    projectId: symphonyProject.id,
                    title: sliceTitle,
                    description: sliceDescription,
                    priority: issue.priority,
                  },
                }
              );
              entry.created = true;
            }

            summary.symphonyFeed.sliced.push(entry);
            existingTitles.add(titleKey);
            remaining -= 1;
          }
        }

        if (toMove.length > 0) {
          console.error(
            `Symphony feed: ${APPLY ? 'moved' : 'would move'} ${toMove.length} issues into Symphony project`
          );
        }
        if (summary.symphonyFeed.sliced.length > 0) {
          console.error(
            `Symphony feed: ${APPLY ? 'created' : 'would create'} ${summary.symphonyFeed.sliced.length} local-slice issues`
          );
        }
        if (summary.symphonyFeed.pendingMoved.length > 0) {
          console.error(
            `Symphony feed: ${APPLY ? 'moved' : 'would move'} ${summary.symphonyFeed.pendingMoved.length} human-only issues to ${pendingState?.name || 'pending state'}`
          );
        }
      }
    }
  } catch (feedErr) {
    console.error(`Symphony feed error (non-fatal): ${feedErr.message}`);
    summary.symphonyFeed.error = feedErr.message;
  }

  summary.finishedAt = new Date().toISOString();
  summary.projectsScanned = team.projects.nodes.length;
  summary.projectsUpdated = summary.updates.length;
  summary.labelsMissingCount = summary.missingLabels.length;

  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  const failure = {
    ok: false,
    error: err.message,
    at: new Date().toISOString(),
    apply: APPLY,
  };
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(failure, null, 2) + '\n');
  console.error(err.message);
  process.exit(1);
});
