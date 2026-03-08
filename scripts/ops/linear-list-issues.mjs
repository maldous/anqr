#!/usr/bin/env node

/**
 * List Linear issues with optional filters.
 *
 * Designed to be called by AI agents for audit/hygiene tasks that need
 * to inspect all open issues without constructing raw GraphQL queries.
 *
 * Usage:
 *   node scripts/ops/linear-list-issues.mjs
 *   node scripts/ops/linear-list-issues.mjs --state Backlog,Todo
 *   node scripts/ops/linear-list-issues.mjs --state Backlog --label reliability
 *   node scripts/ops/linear-list-issues.mjs --open
 *
 * Options:
 *   --team <key>     Team key (default: ANQ)
 *   --state <names>  Comma-separated state names to include (default: all)
 *   --label <name>   Filter by label name (repeatable)
 *   --open           Shortcut: include only non-terminal states
 *   --format <fmt>   Output format: json (default) or table
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: JSON array of issues with identifier, title, state, priority, labels, description.
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

const TERMINAL_STATES = new Set(['done', 'closed', 'cancelled', 'canceled', 'duplicate']);

const HELP_TEXT = `List Linear issues with optional filters.

Usage:
  node scripts/ops/linear-list-issues.mjs [options]

Options:
  --team <key>     Team key (default: ANQ)
  --state <names>  Comma-separated state names to include (default: all)
  --label <name>   Filter by label name (repeatable)
  --open           Include only non-terminal states
  --format <fmt>   Output format: json (default) or table
  -h, --help       Show this help text
`;

function parseArgs(argv) {
  const args = { labels: [], team: 'ANQ', format: 'json' };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--team':
        args.team = value;
        i += 2;
        break;
      case '--state':
        args.states = value.split(',').map((s) => s.trim());
        i += 2;
        break;
      case '--label':
        args.labels.push(value);
        i += 2;
        break;
      case '--open':
        args.open = true;
        i += 1;
        break;
      case '--format':
        args.format = value;
        i += 2;
        break;
      case '--help':
      case '-h':
        args.help = true;
        i += 1;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        console.error('Use --help to view available options.');
        process.exit(1);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (!LINEAR_API_KEY) {
    console.error('ERROR: LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }
  const gql = createGql(LINEAR_API_KEY);

  // Fetch all issues for the team (paginated)
  let allIssues = [];
  let hasMore = true;
  let cursor = null;

  while (hasMore) {
    const result = await gql(
      `query($teamKey: String!, $after: String) {
        team(id: $teamKey) {
          issues(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              identifier
              title
              description
              priority
              state { name }
              labels { nodes { name } }
              parent { identifier }
            }
          }
        }
      }`,
      { teamKey: args.team, after: cursor }
    );

    if (!result.team) {
      console.error(`ERROR: Team '${args.team}' not found`);
      process.exit(1);
    }

    const page = result.team.issues;
    allIssues = allIssues.concat(page.nodes);
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  // Apply filters
  let filtered = allIssues;

  if (args.open) {
    filtered = filtered.filter((i) => !TERMINAL_STATES.has(i.state.name.toLowerCase()));
  }

  if (args.states) {
    const stateSet = new Set(args.states.map((s) => s.toLowerCase()));
    filtered = filtered.filter((i) => stateSet.has(i.state.name.toLowerCase()));
  }

  if (args.labels.length > 0) {
    const labelSet = new Set(args.labels.map((l) => l.toLowerCase()));
    filtered = filtered.filter((i) =>
      i.labels.nodes.some((l) => labelSet.has(l.name.toLowerCase()))
    );
  }

  // Format output
  const output = filtered.map((i) => ({
    identifier: i.identifier,
    title: i.title,
    state: i.state.name,
    priority: i.priority,
    labels: i.labels.nodes.map((l) => l.name),
    parent: i.parent?.identifier || null,
    description: i.description || '',
  }));

  if (args.format === 'table') {
    console.log(
      `${'ID'.padEnd(10)} ${'State'.padEnd(14)} ${'Pri'.padEnd(4)} ${'Labels'.padEnd(20)} Title`
    );
    console.log('-'.repeat(90));
    for (const issue of output) {
      const labels = issue.labels.join(', ') || '-';
      console.log(
        `${issue.identifier.padEnd(10)} ${issue.state.padEnd(14)} ${String(issue.priority).padEnd(4)} ${labels.padEnd(20)} ${issue.title}`
      );
    }
    console.log(`\n${output.length} issues`);
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
