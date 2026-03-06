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
const GUARDIAN_SKIP_LEAD = process.env.GUARDIAN_SKIP_LEAD === '1';

const APPLY = process.argv.includes('--apply');

const gql = createGql(LINEAR_API_KEY);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

async function main() {
  const startedAt = new Date().toISOString();

  const creditStatus = await checkSymphonyCreditStatus();
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
  summary.sentinelCheck = { checked: false, exists: false, created: false };

  if (symphonyProject) {
    const sentinelQuery = await gql(
      `query($projectId: ID!) {
        issues(filter: {
          team: { key: { eq: "ANQ" } },
          project: { id: { eq: $projectId } },
          state: { name: { in: ["Backlog", "Todo", "In Progress"] } }
        }, first: 50) {
          nodes { identifier title }
        }
      }`,
      { projectId: symphonyProject.id }
    );

    summary.sentinelCheck.checked = true;
    const hasSentinel = sentinelQuery.issues.nodes.some((i) => i.title.startsWith('[SENTINEL]'));
    summary.sentinelCheck.exists = hasSentinel;

    if (!hasSentinel && APPLY) {
      const sentinelDescription =
        'Self-replicating heartbeat. Steps: (1) create a copy of this issue in Backlog, (2) post a workpad comment, (3) move this issue to Done. Do NOT create PRs, do NOT run paid actions, do NOT query/audit issues.';

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
  }

  // -----------------------------------------------------------------------
  // Auto-feed Symphony: keep 5-10 open issues in the Symphony project.
  // Moves highest-priority automatable issues from other projects.
  // This replaces the old sentinel-driven feeding (too complex for small models).
  // Wrapped in try/catch so a failure here doesn't break the entire guardian.
  // -----------------------------------------------------------------------
  summary.symphonyFeed = { checked: false, openCount: 0, moved: [] };

  try {
    if (symphonyProject) {
      const symphonyIssues = await gql(
        `query($projectId: ID!) {
        issues(filter: {
          team: { key: { eq: "ANQ" } },
          project: { id: { eq: $projectId } },
          state: { name: { in: ["Backlog", "Todo", "In Progress"] } }
        }, first: 50) {
          nodes { identifier title labels { nodes { name } } }
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
              priority
              project { id name }
              labels { nodes { name } }
            }
          }
        }`
        );

        const HUMAN_LABELS = new Set(['payment', 'billing', 'paid']);
        const movable = candidates.issues.nodes.filter((i) => {
          if (i.project?.id === symphonyProject.id) return false;
          if (i.title.startsWith('[SENTINEL]')) return false;
          if (i.title.startsWith('[NEEDS-PRECOMPUTE]')) return false;
          const labelNames = i.labels.nodes.map((l) => l.name.toLowerCase());
          if (labelNames.some((l) => HUMAN_LABELS.has(l))) return false;
          return true;
        });

        movable.sort((a, b) => a.priority - b.priority);
        const toMove = movable.slice(0, needed);

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

        if (toMove.length > 0) {
          console.error(
            `Symphony feed: ${APPLY ? 'moved' : 'would move'} ${toMove.length} issues into Symphony project`
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
