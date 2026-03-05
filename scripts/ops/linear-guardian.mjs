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
const REQUIRED_LABELS = (process.env.LINEAR_REQUIRED_LABELS ||
  'web,android,ios,api,ads,analytics,security,perf,reliability,p0,p1')
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
