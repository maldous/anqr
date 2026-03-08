#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createGql } from './lib/linear-client.mjs';
import { sendNotification, linearIssueUrl } from './lib/notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'linear-guardian');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'ANQ';
const CODEX_USER_NAME = process.env.LINEAR_CODEX_USER_NAME || 'Codex';
const HUMAN_USER_NAME = process.env.LINEAR_HUMAN_USER_NAME || 'Matthew Aldous';
const REQUIRED_LABELS = (
  process.env.LINEAR_REQUIRED_LABELS ||
  'web,android,ios,api,ads,analytics,security,perf,reliability,p0,p1,payment,billing,paid'
)
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const SYMPHONY_DASHBOARD_URL = process.env.SYMPHONY_DASHBOARD_URL || 'http://127.0.0.1:4040';
const GUARDIAN_SKIP_LEAD = process.env.GUARDIAN_SKIP_LEAD === '1';
const GUARDIAN_TASK_DESC_MAX = Number(process.env.GUARDIAN_TASK_DESC_MAX || 1200);
const GUARDIAN_TASK_CHECKLIST_MAX = Number(process.env.GUARDIAN_TASK_CHECKLIST_MAX || 4);
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

const LABEL_CLASSIFICATION_RULES = [
  {
    label: 'reliability',
    patterns: [
      /\breliability\b/i,
      /\bguardian\b/i,
      /\bmodel[\s-]?injector\b/i,
      /\bcredit[\s-]?gate\b/i,
      /\bsymphony\b/i,
      /\bself[\s-]?heal/i,
      /\bops\b/i,
      /^\[CI\]/,
    ],
  },
  {
    label: 'android',
    patterns: [/\bandroid\b/i, /\bcapacitor\b/i, /\baab\b/i, /\bapk\b/i, /\bgoogle play\b/i],
  },
  { label: 'ios', patterns: [/\bios\b/i, /\bswift\b/i, /\bxcode\b/i, /\bapp store\b/i] },
  { label: 'api', patterns: [/\bapi\b/i, /\bserverless\b/i, /\bnetlify func/i, /\bendpoint\b/i] },
  {
    label: 'ads',
    patterns: [/\badmob\b/i, /\badsense\b/i, /\bad[\s-]?unit\b/i, /\bad[\s-]?slot\b/i],
  },
  { label: 'analytics', patterns: [/\banalytics\b/i, /\btelemetry\b/i] },
  { label: 'security', patterns: [/\bsecurity\b/i, /\bxss\b/i, /\bcsp\b/i, /\bcors\b/i] },
  { label: 'perf', patterns: [/\bperf(ormance)?\b/i, /\bbundle[\s-]?size\b/i, /\blighthouse\b/i] },
  { label: 'payment', patterns: [/\bpayment\b/i, /\bstripe\b/i] },
  { label: 'billing', patterns: [/\bbilling\b/i, /\binvoice\b/i] },
  { label: 'paid', patterns: [/\bpaid\b/i, /\bsubscription\b/i, /\bpremium\b/i] },
];
const SEMANTIC_LABELS = new Set(['p0', 'p1', 'finished']);

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

function classifyIssueLabel(issue) {
  const title = issue.title || '';
  if (title.startsWith('[PARENT]')) return 'reliability';
  if (title.startsWith('[CHILD]')) return 'reliability';
  const text = `${title}\n${issue.description || ''}`;
  for (const rule of LABEL_CLASSIFICATION_RULES) {
    if (rule.patterns.some((re) => re.test(text))) return rule.label;
  }
  return 'web';
}

function extractValidationHint(description) {
  if (!description)
    return 'Run the smallest deterministic validation command that covers the change.';
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
    'When complete: post a short comment on the parent issue with what was done and what remains.'
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

async function getSymphonyRetryQueue() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(SYMPHONY_DASHBOARD_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await res.text();
    const start = html.indexOf('Retry queue');
    if (start === -1) return [];
    const retrySection = html.slice(start);
    const seen = new Set();
    const entries = [];
    const idRe = /ANQ-\d+/g;
    let match;
    while ((match = idRe.exec(retrySection)) !== null) {
      const id = match[0];
      if (!seen.has(id)) {
        seen.add(id);
        entries.push(id);
      }
    }
    return entries;
  } catch {
    return [];
  }
}

async function main() {
  const startedAt = new Date().toISOString();

  const creditStatus = await checkSymphonyCreditStatus();
  const runningIssueIds = await getSymphonyRunningIssueIds();
  const skipLead = GUARDIAN_SKIP_LEAD;
  const leadSkipReason = GUARDIAN_SKIP_LEAD ? 'GUARDIAN_SKIP_LEAD=1' : null;

  if (skipLead) {
    console.error(`Lead enforcement skipped: ${leadSkipReason}`);
  }

  const summary = {
    startedAt,
    teamKey: TEAM_KEY,
    leadUser: HUMAN_USER_NAME,
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

  const codexMember = team.members.nodes.find((m) => m.active && m.name === CODEX_USER_NAME);
  const codexAssigneeId = codexMember?.id || null;
  const humanMember = team.members.nodes.find((m) => m.active && m.name === HUMAN_USER_NAME);
  const humanAssigneeId = humanMember?.id || null;

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
  summary.unlabeledAudit = { checked: false, classified: [] };
  const p0Label = labelByName.get('p0');
  const p1Label = labelByName.get('p1');
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
          description
          priority
          state { name }
          labels(first: 50) { nodes { id name } }
        }
      }
    }`
  );
  summary.labelHygiene.checked = true;
  summary.unlabeledAudit.checked = true;

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

    const hasDomainLabel = issue.labels.nodes.some(
      (l) => !SEMANTIC_LABELS.has(l.name.toLowerCase())
    );
    let classifiedAs = null;
    if (!hasDomainLabel) {
      classifiedAs = classifyIssueLabel(issue);
      const classifiedLabel = labelByName.get(classifiedAs);
      if (classifiedLabel) {
        nextLabelIds.push(classifiedLabel.id);
      }
    }

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
    if (classifiedAs) {
      summary.unlabeledAudit.classified.push({
        identifier: issue.identifier,
        assignedLabel: classifiedAs,
        updated: update.updated,
      });
    }
  }
  if (summary.unlabeledAudit.classified.length > 0) {
    console.error(
      `Unlabeled audit: ${APPLY ? 'assigned' : 'would assign'} domain labels to ${summary.unlabeledAudit.classified.length} issues`
    );
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
    if (/\burgent\b/i.test(issue.title)) {
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
  // Assignee backfill: [HUMAN]/[EMAIL] issues → matthewaldous.
  // Non-human issues must NOT be assigned to any specific user — the
  // credit-gate handles AI provider routing independently of Linear assignee.
  // If any issue is still assigned to Codex (legacy), unassign it.
  // -----------------------------------------------------------------------
  summary.assigneeBackfill = { checked: false, assignedHuman: [], unassignedFromCodex: [] };
  if (humanAssigneeId) {
    const allIssues = await gql(
      `query {
        issues(
          filter: {
            team: { key: { eq: "ANQ" } },
            state: { type: { in: ["backlog", "unstarted", "started", "completed"] } }
          },
          first: 250
        ) {
          nodes { id identifier title assignee { id } }
        }
      }`
    );
    summary.assigneeBackfill.checked = true;
    for (const issue of allIssues.issues.nodes) {
      const title = issue.title || '';
      const isHuman = title.startsWith('[HUMAN]') || title.startsWith('[EMAIL]');
      const currentId = issue.assignee?.id || null;

      if (isHuman && currentId !== humanAssigneeId) {
        const update = { identifier: issue.identifier, assignee: HUMAN_USER_NAME, updated: false };
        if (APPLY) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            { id: issue.id, input: { assigneeId: humanAssigneeId } }
          );
          update.updated = true;
        }
        summary.assigneeBackfill.assignedHuman.push(update);
      } else if (!isHuman && codexAssigneeId && currentId === codexAssigneeId) {
        const update = { identifier: issue.identifier, updated: false };
        if (APPLY) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            { id: issue.id, input: { assigneeId: null } }
          );
          update.updated = true;
        }
        summary.assigneeBackfill.unassignedFromCodex.push(update);
      }
    }
    const totalFixed =
      summary.assigneeBackfill.assignedHuman.length +
      summary.assigneeBackfill.unassignedFromCodex.length;
    if (totalFixed > 0) {
      console.error(
        `Assignee backfill: ${APPLY ? 'fixed' : 'would fix'} ${totalFixed} issues (${summary.assigneeBackfill.assignedHuman.length} → ${HUMAN_USER_NAME}, ${summary.assigneeBackfill.unassignedFromCodex.length} unassigned from ${CODEX_USER_NAME})`
      );
    }
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
  // Priority/state hygiene: with max_concurrent_agents=1, keep In Progress
  // aligned to live Symphony running sessions.
  // If no live sessions exist, promote highest-priority work.
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
      actionable.sort(
        (a, b) => a.priority - b.priority || a.identifier.localeCompare(b.identifier)
      );
      const target = actionable[0] || null;
      summary.priorityStateSync.checked = true;
      summary.priorityStateSync.target = target ? target.identifier : null;

      if (target) {
        const byIdentifier = new Map(symphonyOpen.issues.nodes.map((i) => [i.identifier, i]));
        const runningSet = new Set(runningIssueIds);
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

        // Demote ALL In Progress issues not associated with a live running
        // session. This runs unconditionally (not just when sessions exist)
        // to handle the edge case where an agent crash leaves an issue stuck
        // In Progress with no active session to complete it (F7).
        {
          const allowedInProgress = new Set(runningSet);
          for (const issue of actionable) {
            if (issue.state.name !== 'In Progress') continue;
            if (allowedInProgress.has(issue.identifier)) continue;
            if (issue.identifier === target.identifier) continue;
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
        }

        // When no sessions are running, promote highest-priority target.
        if (runningSet.size === 0 && target.state.name !== 'In Progress') {
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
  } else if (!humanAssigneeId) {
    console.error(`Lead enforcement skipped: '${HUMAN_USER_NAME}' not found in team`);
    summary.skippedProjects = team.projects.nodes.map((p) => p.name);
  } else {
    for (const project of team.projects.nodes) {
      const currentLeadId = project.lead?.id || null;
      if (currentLeadId === humanAssigneeId) {
        summary.unchangedProjects.push(project.name);
        continue;
      }

      const update = {
        projectId: project.id,
        projectName: project.name,
        fromLead: project.lead?.name || null,
        toLead: HUMAN_USER_NAME,
        changed: false,
      };

      if (APPLY) {
        await gql(
          `mutation ProjectLeadUpdate($id: String!, $input: ProjectUpdateInput!) {
            projectUpdate(id: $id, input: $input) { success project { id name lead { id name } } }
          }`,
          { id: project.id, input: { leadId: humanAssigneeId } }
        );
        update.changed = true;
      }

      summary.updates.push(update);
    }
  }

  const symphonyProject = team.projects.nodes.find((p) => p.name === 'Symphony');

  // -----------------------------------------------------------------------
  // Symphony liveness: verify the Symphony orchestrator is running.
  // This replaces the old AI-powered sentinel heartbeat with a deterministic
  // check that cannot enter retry queues or consume AI credits.
  // -----------------------------------------------------------------------
  summary.symphonyLiveness = {
    checked: false,
    serviceActive: false,
    dashboardReachable: false,
    healthy: false,
  };
  try {
    const serviceCheck = spawnSync('systemctl', ['--user', 'is-active', 'symphony-anqr.service'], {
      encoding: 'utf-8',
      timeout: 5000,
    });
    summary.symphonyLiveness.serviceActive = serviceCheck.status === 0;
    summary.symphonyLiveness.dashboardReachable = creditStatus.reachable;
    summary.symphonyLiveness.healthy =
      summary.symphonyLiveness.serviceActive && creditStatus.reachable;
    summary.symphonyLiveness.checked = true;

    if (!summary.symphonyLiveness.healthy) {
      const reason = !summary.symphonyLiveness.serviceActive
        ? 'systemd service inactive'
        : 'dashboard unreachable';
      console.error(`Symphony liveness: UNHEALTHY (${reason})`);
      sendNotification({
        subject: 'Symphony liveness check failed',
        body: [
          `The Symphony orchestrator is unhealthy: ${reason}.`,
          '',
          `Service active: ${summary.symphonyLiveness.serviceActive}`,
          `Dashboard reachable: ${creditStatus.reachable}`,
          `Credit status: ${creditStatus.hasCredits === null ? 'unknown' : creditStatus.hasCredits ? 'available' : 'exhausted'}`,
          `Balance: ${creditStatus.balance ?? 'unknown'}`,
          '',
          'Diagnostic commands:',
          '  systemctl --user status symphony-anqr.service',
          '  journalctl --user -u symphony-anqr.service --since "10 min ago" --no-pager',
          '  curl -sf http://127.0.0.1:4040 | head -20',
        ].join('\n'),
        severity: 'critical',
      });
    }
  } catch (livenessErr) {
    console.error(`Symphony liveness error (non-fatal): ${livenessErr.message}`);
    summary.symphonyLiveness.error = livenessErr.message;
  }

  // -----------------------------------------------------------------------
  // Harness-driven issue creation: read the latest harness report and create
  // Linear issues for FAIL/ERROR checks. Tracks state to avoid duplicates.
  // This replaces the old AI sentinel's job of reviewing harness reports.
  // -----------------------------------------------------------------------
  summary.harnessIssueCreation = {
    checked: false,
    created: [],
    alreadyTracked: [],
    resolved: [],
  };
  const harnessStatePath = path.join(REPORTS_DIR, 'harness-issue-state.json');
  try {
    const harnessReportPath = path.join(PROJECT_ROOT, 'reports', 'harness', 'latest.json');
    if (fs.existsSync(harnessReportPath)) {
      const harnessReport = JSON.parse(fs.readFileSync(harnessReportPath, 'utf-8'));

      let harnessState = {};
      if (fs.existsSync(harnessStatePath)) {
        harnessState = JSON.parse(fs.readFileSync(harnessStatePath, 'utf-8'));
      }

      const reliabilityLabel = team.labels.nodes.find(
        (l) => l.name.toLowerCase() === 'reliability'
      );
      let doneStateId = null;
      if (APPLY) {
        const doneStateData = await gql(
          `query($teamId: ID!) {
            workflowStates(
              filter: { team: { id: { eq: $teamId } }, name: { eq: "Done" } }
              first: 1
            ) {
              nodes { id }
            }
          }`,
          { teamId: team.id }
        );
        doneStateId = doneStateData.workflowStates.nodes[0]?.id || null;
      }

      for (const [checkId, check] of Object.entries(harnessReport.checks || {})) {
        if (check.status !== 'FAIL' && check.status !== 'ERROR') {
          if (harnessState[checkId]?.status === 'open') {
            harnessState[checkId].status = 'resolved';
            harnessState[checkId].resolvedAt = new Date().toISOString();
            if (APPLY && doneStateId) {
              const openHarnessIssues = await gql(
                `query($teamId: ID!, $titlePrefix: String!) {
                  issues(
                    filter: {
                      team: { id: { eq: $teamId } },
                      title: { startsWith: $titlePrefix },
                      state: { type: { in: ["backlog", "unstarted", "started"] } }
                    },
                    first: 20
                  ) {
                    nodes { id identifier title }
                  }
                }`,
                { teamId: team.id, titlePrefix: `[HARNESS] ${checkId}:` }
              );
              for (const issue of openHarnessIssues.issues.nodes || []) {
                await gql(
                  `mutation($input: CommentCreateInput!) {
                    commentCreate(input: $input) { success }
                  }`,
                  {
                    input: {
                      issueId: issue.id,
                      body: [
                        `Auto-resolved by guardian: harness check \`${checkId}\` now reports **${check.status}**.`,
                        '',
                        `Evidence source: reports/harness/latest.json at ${harnessReport.timestamp}.`,
                      ].join('\n'),
                    },
                  }
                );
                await gql(
                  `mutation($id: String!, $input: IssueUpdateInput!) {
                    issueUpdate(id: $id, input: $input) { success }
                  }`,
                  { id: issue.id, input: { stateId: doneStateId } }
                );
                summary.harnessIssueCreation.resolved.push({
                  checkId,
                  identifier: issue.identifier,
                });
              }
            }
          }
          continue;
        }

        if (harnessState[checkId]?.status === 'open') {
          summary.harnessIssueCreation.alreadyTracked.push(checkId);
          continue;
        }

        const findings = (check.findings || [])
          .map((f) => `- ${f.severity}: ${f.message}`)
          .join('\n');
        const metrics = Object.entries(check.metrics || {})
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n');

        const issueTitle = `[HARNESS] ${checkId}: ${check.status}`;
        const issueDescription = [
          `Harness check \`${checkId}\` reported **${check.status}** at ${harnessReport.timestamp}.`,
          '',
          '## Metrics',
          metrics || '(none)',
          '',
          '## Findings',
          findings || '(none)',
          '',
          '## Action Required',
          'Investigate and fix the failing check. Run the harness to verify:',
          '```bash',
          'node scripts/ops/harness-report.mjs --profile=continuous',
          '```',
          '',
          'The guardian will automatically mark this resolved when the check passes.',
        ].join('\n');

        const entry = { checkId, title: issueTitle, created: false };

        if (APPLY && symphonyProject) {
          const created = await gql(
            `mutation($input: IssueCreateInput!) {
              issueCreate(input: $input) { success issue { identifier } }
            }`,
            {
              input: {
                teamId: team.id,
                projectId: symphonyProject.id,
                title: issueTitle,
                description: issueDescription,
                priority: 2,
                ...(reliabilityLabel ? { labelIds: [reliabilityLabel.id] } : {}),
              },
            }
          );
          entry.created = true;
          entry.identifier = created.issueCreate?.issue?.identifier || null;
          harnessState[checkId] = {
            status: 'open',
            issueIdentifier: entry.identifier,
            createdAt: new Date().toISOString(),
            checkStatus: check.status,
          };
        }

        summary.harnessIssueCreation.created.push(entry);
      }

      summary.harnessIssueCreation.checked = true;
      ensureDir(REPORTS_DIR);
      fs.writeFileSync(harnessStatePath, JSON.stringify(harnessState, null, 2) + '\n');

      if (summary.harnessIssueCreation.created.length > 0) {
        console.error(
          `Harness issues: ${APPLY ? 'created' : 'would create'} ${summary.harnessIssueCreation.created.length} issues for failing checks`
        );
      }
    }
  } catch (harnessErr) {
    console.error(`Harness issue creation error (non-fatal): ${harnessErr.message}`);
    summary.harnessIssueCreation.error = harnessErr.message;
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
  // Auto-feed Symphony: keep 2-3 open issues in the Symphony project.
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
          nodes { id identifier title priority labels { nodes { name } } }
        }
      }`,
        { projectId: symphonyProject.id }
      );

      const openIssues = symphonyIssues.issues.nodes;
      summary.symphonyFeed.checked = true;
      summary.symphonyFeed.openCount = openIssues.length;

      // [PARENT] invariant: drain tracking/coordination issues from Symphony
      // project. These are not executable and would burn all retries (F1).
      summary.symphonyFeed.parentDrained = [];
      const parentInSymphony = openIssues.filter((i) => i.title.startsWith('[PARENT]'));
      for (const issue of parentInSymphony) {
        const entry = { identifier: issue.identifier, title: issue.title, drained: false };
        if (APPLY) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            { id: issue.id, input: { projectId: null } }
          );
          entry.drained = true;
        }
        summary.symphonyFeed.parentDrained.push(entry);
      }
      if (parentInSymphony.length > 0) {
        console.error(
          `[PARENT] drain: ${APPLY ? 'removed' : 'would remove'} ${parentInSymphony.length} tracking issues from Symphony project`
        );
      }

      const TARGET_MIN = 2;
      const TARGET_MAX = 3;

      if (openIssues.length < TARGET_MIN) {
        const needed = TARGET_MAX - openIssues.length;

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

      // Overflow drain: if too many issues in Symphony, move lowest-priority back out.
      if (openIssues.length > TARGET_MAX) {
        summary.symphonyFeed.drained = [];
        const runningSet = new Set(runningIssueIds);
        const drainCandidates = openIssues
          .filter((i) => !runningSet.has(i.identifier))
          .sort((a, b) => b.priority - a.priority || b.identifier.localeCompare(a.identifier));
        const excess = openIssues.length - TARGET_MAX;
        for (const issue of drainCandidates.slice(0, excess)) {
          const entry = { identifier: issue.identifier, title: issue.title, drained: false };
          if (APPLY) {
            await gql(
              `mutation($id: String!, $input: IssueUpdateInput!) {
                issueUpdate(id: $id, input: $input) { success }
              }`,
              { id: issue.id, input: { projectId: null } }
            );
            entry.drained = true;
          }
          summary.symphonyFeed.drained.push(entry);
        }
        if (summary.symphonyFeed.drained.length > 0) {
          console.error(
            `Symphony overflow: ${APPLY ? 'drained' : 'would drain'} ${summary.symphonyFeed.drained.length} excess issues from Symphony project`
          );
        }
      }
    }
  } catch (feedErr) {
    console.error(`Symphony feed error (non-fatal): ${feedErr.message}`);
    summary.symphonyFeed.error = feedErr.message;
  }

  // -----------------------------------------------------------------------
  // Retry queue health: if 2+ issues are queued for orchestrator slots,
  // the Symphony project is overfed. Drain retry-queued issues back out
  // so they stop burning retry attempts on structural slot contention.
  // -----------------------------------------------------------------------
  summary.retryQueueHealth = { checked: false, retryCount: 0, drained: [] };
  try {
    const retryQueueIds = await getSymphonyRetryQueue();
    summary.retryQueueHealth.checked = true;
    summary.retryQueueHealth.retryCount = retryQueueIds.length;
    summary.retryQueueHealth.retryIds = retryQueueIds;

    if (retryQueueIds.length >= 2 && symphonyProject) {
      const retrySet = new Set(retryQueueIds);
      const runningSet = new Set(runningIssueIds);

      const symphonyBacklog = await gql(
        `query($projectId: ID!) {
          issues(filter: {
            team: { key: { eq: "ANQ" } },
            project: { id: { eq: $projectId } },
            state: { name: { in: ["Backlog", "Todo"] } }
          }, first: 50) {
            nodes { id identifier title priority }
          }
        }`,
        { projectId: symphonyProject.id }
      );

      const drainCandidates = symphonyBacklog.issues.nodes.filter(
        (i) => !runningSet.has(i.identifier) && retrySet.has(i.identifier)
      );

      for (const issue of drainCandidates) {
        const entry = {
          identifier: issue.identifier,
          title: issue.title,
          drained: false,
        };
        if (APPLY) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            { id: issue.id, input: { projectId: null } }
          );
          entry.drained = true;
        }
        summary.retryQueueHealth.drained.push(entry);
      }

      if (summary.retryQueueHealth.drained.length > 0) {
        console.error(
          `Retry queue health: ${APPLY ? 'drained' : 'would drain'} ${summary.retryQueueHealth.drained.length} retry-queued issues from Symphony project`
        );
        sendNotification({
          subject: `Symphony retry queue overflow: drained ${summary.retryQueueHealth.drained.length} issues`,
          body: [
            `${retryQueueIds.length} issues were stuck in the retry queue competing for orchestrator slots.`,
            '',
            'Drained issues:',
            '',
            ...summary.retryQueueHealth.drained.map(
              (d) => `• ${d.identifier}: ${d.title}\n  ${linearIssueUrl(d.identifier)}`
            ),
            '',
            'These issues will be re-fed by the guardian when slots free up.',
          ].join('\n'),
          severity: 'warning',
        });
      }
    }
  } catch (retryErr) {
    console.error(`Retry queue health error (non-fatal): ${retryErr.message}`);
    summary.retryQueueHealth.error = retryErr.message;
  }

  // -----------------------------------------------------------------------
  // Retry escalation: if an issue has been stuck in the retry queue across
  // multiple guardian passes (>30 min), auto-route it to Todo for later
  // AI retry instead of polluting the human-only Pending lane.
  // Prevents infinite retry loops that block the queue (F2).
  // -----------------------------------------------------------------------
  summary.retryEscalation = { checked: false, escalated: [], tracked: 0 };
  const retryEscalationStatePath = path.join(REPORTS_DIR, 'retry-escalation-state.json');
  try {
    let retryState = {};
    if (fs.existsSync(retryEscalationStatePath)) {
      retryState = JSON.parse(fs.readFileSync(retryEscalationStatePath, 'utf-8'));
    }

    const retryQueueForEscalation = await getSymphonyRetryQueue();
    const nowMs = Date.now();
    const ESCALATION_THRESHOLD_MS = 30 * 60 * 1000;

    const currentRetrySet = new Set(retryQueueForEscalation);
    for (const id of Object.keys(retryState)) {
      if (!currentRetrySet.has(id)) {
        delete retryState[id];
      }
    }
    for (const id of retryQueueForEscalation) {
      if (!retryState[id]) {
        retryState[id] = { firstSeen: nowMs, passes: 0 };
      }
      retryState[id].passes += 1;
      retryState[id].lastSeen = nowMs;
    }

    summary.retryEscalation.tracked = Object.keys(retryState).length;

    const retryTargetStates = await gql(
      `query($teamId: ID!) {
        workflowStates(
          filter: { team: { id: { eq: $teamId } }, name: { in: ["Todo", "Backlog"] } }
          first: 10
        ) {
          nodes { id name }
        }
      }`,
      { teamId: team.id }
    );
    const retryTodoState =
      retryTargetStates.workflowStates.nodes.find((s) => s.name === 'Todo') ||
      retryTargetStates.workflowStates.nodes.find((s) => s.name === 'Backlog') ||
      null;

    if (retryTodoState) {
      for (const [id, tracked] of Object.entries(retryState)) {
        const elapsed = nowMs - tracked.firstSeen;
        if (elapsed < ESCALATION_THRESHOLD_MS) continue;

        const issueData = await gql(
          `query($id: String!) { issue(id: $id) { id identifier title state { name } } }`,
          { id }
        );
        const issue = issueData.issue;
        if (!issue) continue;
        if (issue.state.name === retryTodoState.name) continue;
        if (issue.title.startsWith('[HUMAN]')) continue;

        const entry = {
          identifier: issue.identifier,
          title: issue.title,
          minutesInRetry: Math.round(elapsed / 60000),
          passes: tracked.passes,
          escalated: false,
        };

        if (APPLY) {
          await gql(
            `mutation($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) { success }
            }`,
            {
              id: issue.id,
              input: { stateId: retryTodoState.id },
            }
          );
          await gql(
            `mutation($input: CommentCreateInput!) {
              commentCreate(input: $input) { success }
            }`,
            {
              input: {
                issueId: issue.id,
                body: [
                  `Auto-escalated by guardian after ${entry.minutesInRetry} minutes in retry queue (${tracked.passes} passes).`,
                  '',
                  'The AI agent could not complete this task after multiple attempts.',
                  'Possible causes: model capability mismatch, missing CLI tooling, or infrastructure issue.',
                  '',
                  `Moved to ${retryTodoState.name} for later AI retry when stronger models/capacity are available.`,
                ].join('\n'),
              },
            }
          );
          entry.escalated = true;
          delete retryState[id];
        }

        summary.retryEscalation.escalated.push(entry);
      }
    }

    summary.retryEscalation.checked = true;
    ensureDir(REPORTS_DIR);
    fs.writeFileSync(retryEscalationStatePath, JSON.stringify(retryState, null, 2) + '\n');

    if (summary.retryEscalation.escalated.length > 0) {
      console.error(
        `Retry escalation: ${APPLY ? 'escalated' : 'would escalate'} ${summary.retryEscalation.escalated.length} stuck issues to ${retryTodoState?.name || 'Todo'}`
      );
      sendNotification({
        subject: `Symphony retry escalation: ${summary.retryEscalation.escalated.length} issues auto-escalated`,
        body: [
          `Issues stuck in retry queue for >30 min and auto-escalated to ${retryTodoState?.name || 'Todo'}:`,
          '',
          ...summary.retryEscalation.escalated.map((e) =>
            [
              `• ${e.identifier}: ${e.title}`,
              `  Stuck for ${e.minutesInRetry} min (${e.passes} guardian passes)`,
              `  ${linearIssueUrl(e.identifier)}`,
            ].join('\n')
          ),
          '',
          'These remain AI-owned and should be retried from Todo when stronger models/capacity are available.',
        ].join('\n'),
        severity: 'warning',
      });
    }
  } catch (escalationErr) {
    console.error(`Retry escalation error (non-fatal): ${escalationErr.message}`);
    summary.retryEscalation.error = escalationErr.message;
  }

  // -----------------------------------------------------------------------
  // Project health: compute and update health for each project.
  // Health is derived from issue completion ratios and active work.
  // Only posts a Linear project update when health changes.
  // -----------------------------------------------------------------------
  summary.projectHealth = { checked: false, projects: [] };
  const healthStatePath = path.join(REPORTS_DIR, 'project-health-state.json');
  try {
    let previousHealth = {};
    if (fs.existsSync(healthStatePath)) {
      previousHealth = JSON.parse(fs.readFileSync(healthStatePath, 'utf-8'));
    }

    for (const project of team.projects.nodes) {
      const projectIssues = await gql(
        `query($projectId: ID!) {
          issues(filter: {
            team: { key: { eq: "ANQ" } },
            project: { id: { eq: $projectId } }
          }, first: 250) {
            nodes { state { name type } }
          }
        }`,
        { projectId: project.id }
      );

      const issues = projectIssues.issues.nodes;
      if (issues.length === 0) continue;

      const done = issues.filter((i) => i.state.type === 'completed').length;
      const inProgress = issues.filter((i) => i.state.name === 'In Progress').length;
      const canceled = issues.filter((i) => i.state.type === 'canceled').length;
      const active = issues.length - canceled;
      if (active === 0) continue;

      const doneRatio = done / active;
      let health;
      if (doneRatio >= 0.3 || (inProgress > 0 && doneRatio >= 0.15)) {
        health = 'onTrack';
      } else if (doneRatio >= 0.05 || inProgress > 0) {
        health = 'atRisk';
      } else {
        health = 'offTrack';
      }

      const entry = {
        name: project.name,
        total: active,
        done,
        inProgress,
        health,
        previousHealth: previousHealth[project.id] || null,
        updated: false,
      };

      if (health !== previousHealth[project.id] && APPLY) {
        await gql(
          `mutation($input: ProjectUpdateCreateInput!) {
            projectUpdateCreate(input: $input) { success }
          }`,
          {
            input: {
              projectId: project.id,
              health,
              body: `Guardian health update: ${done}/${active} done, ${inProgress} in progress → ${health}`,
            },
          }
        );
        entry.updated = true;
        previousHealth[project.id] = health;
      } else {
        previousHealth[project.id] = health;
      }

      summary.projectHealth.projects.push(entry);
    }

    summary.projectHealth.checked = true;
    ensureDir(REPORTS_DIR);
    fs.writeFileSync(healthStatePath, JSON.stringify(previousHealth, null, 2) + '\n');

    const healthUpdated = summary.projectHealth.projects.filter((p) => p.updated).length;
    if (healthUpdated > 0) {
      console.error(
        `Project health: ${APPLY ? 'updated' : 'would update'} ${healthUpdated} project(s)`
      );
    }
  } catch (healthErr) {
    console.error(`Project health error (non-fatal): ${healthErr.message}`);
    summary.projectHealth.error = healthErr.message;
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
