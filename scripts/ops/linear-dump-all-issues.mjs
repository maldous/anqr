#!/usr/bin/env node

/**
 * Dump ALL Linear issues (active, completed, archived, cancelled) to a JSON file.
 *
 * Usage:
 *   node scripts/ops/linear-dump-all-issues.mjs [--output issues.json]
 *
 * Options:
 *   --team <key>     Team key (default: ANQ)
 *   --output <path>  Output file path (default: linear-all-issues.json)
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: JSON file with all issues including archived ones.
 */

import { createGql } from './lib/linear-client.mjs';
import { writeFileSync } from 'fs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

const HELP_TEXT = `Dump all Linear issues to JSON.

Usage:
  node scripts/ops/linear-dump-all-issues.mjs [options]

Options:
  --team <key>       Team key (default: ANQ)
  --output <path>    Output file path (default: linear-all-issues.json)
  -h, --help         Show this help text
`;

function parseArgs(argv) {
  const args = { team: 'ANQ', output: 'linear-all-issues.json' };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--team':
        args.team = value;
        i += 2;
        break;
      case '--output':
        args.output = value;
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

/**
 * Fetch all issues for a team with pagination, including archived.
 */
async function fetchAllIssues(gql, teamId) {
  const allIssues = [];
  let hasMore = true;
  let cursor = null;
  let totalFetched = 0;

  // Fetch active/completed issues
  while (hasMore) {
    const result = await gql(
      `query($teamId: String!, $after: String) {
        team(id: $teamId) {
          issues(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              identifier
              title
              description
              priority
              createdAt
              updatedAt
              completedAt
              archivedAt
              state { name }
              labels { nodes { name } }
              parent { identifier }
              assignee { name email }
              creator { name email }
            }
          }
        }
      }`,
      { teamId, after: cursor }
    );

    if (!result.team) {
      throw new Error(`Team not found`);
    }

    const page = result.team.issues;
    allIssues.push(...page.nodes);
    totalFetched += page.nodes.length;
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;

    console.error(`Fetched ${totalFetched} active/completed issues...`);
  }

  // Fetch archived issues (separate query)
  hasMore = true;
  cursor = null;
  let archivedFetched = 0;

  while (hasMore) {
    const result = await gql(
      `query($teamId: String!, $after: String) {
        team(id: $teamId) {
          issues(first: 100, after: $after, filter: { archivedAt: { neq: null } }) {
            pageInfo { hasNextPage endCursor }
            nodes {
              identifier
              title
              description
              priority
              createdAt
              updatedAt
              completedAt
              archivedAt
              state { name }
              labels { nodes { name } }
              parent { identifier }
              assignee { name email }
              creator { name email }
            }
          }
        }
      }`,
      { teamId, after: cursor }
    );

    if (!result.team) {
      throw new Error(`Team not found`);
    }

    const page = result.team.issues;
    // Avoid duplicates by checking identifier
    const existingIds = new Set(allIssues.map((i) => i.identifier));
    const newArchived = page.nodes.filter((i) => !existingIds.has(i.identifier));
    allIssues.push(...newArchived);
    archivedFetched += newArchived.length;
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;

    console.error(`Fetched ${archivedFetched} additional archived issues...`);
  }

  return allIssues;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (!LINEAR_API_KEY) {
    console.error('ERROR: LINEAR_API_KEY environment variable is required');
    console.error('Set it with: export LINEAR_API_KEY=lin_api_...');
    process.exit(1);
  }

  const gql = createGql(LINEAR_API_KEY);

  console.error(`Fetching team '${args.team}'...`);

  // Resolve team by key to get ID
  const teamLookup = await gql(
    `query($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 1) {
        nodes { id name }
      }
    }`,
    { key: args.team }
  );

  const team = teamLookup.teams.nodes[0];
  if (!team) {
    console.error(`ERROR: Team '${args.team}' not found`);
    process.exit(1);
  }

  console.error(`Found team: ${team.name} (${team.id})`);
  console.error('Fetching all issues (this may take a while)...');

  const allIssues = await fetchAllIssues(gql, team.id);

  console.error(`Total issues fetched: ${allIssues.length}`);

  // Transform to clean output format
  const output = allIssues.map((i) => ({
    identifier: i.identifier,
    title: i.title,
    description: i.description || '',
    priority: i.priority,
    state: i.state.name,
    labels: i.labels.nodes.map((l) => l.name),
    parent: i.parent?.identifier || null,
    assignee: i.assignee ? { name: i.assignee.name, email: i.assignee.email } : null,
    creator: i.creator ? { name: i.creator.name, email: i.creator.email } : null,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    completedAt: i.completedAt,
    archivedAt: i.archivedAt,
  }));

  // Sort by identifier (which is typically chronological)
  output.sort((a, b) => a.identifier.localeCompare(b.identifier));

  // Write to file
  writeFileSync(args.output, JSON.stringify(output, null, 2));
  console.error(`Wrote ${output.length} issues to ${args.output}`);
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
