#!/usr/bin/env node

/**
 * Move a Linear issue to a named workflow state.
 *
 * Designed to be called by AI agents instead of writing raw GraphQL mutations.
 *
 * Usage:
 *   node scripts/ops/linear-update-state.mjs --issue ANQ-106 --state "In Progress"
 *
 * Options:
 *   --issue <ID>    Issue identifier (e.g. ANQ-106) — required
 *   --state <name>  Target state name (e.g. "In Progress", "Done", "Backlog") — required
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: prints "<identifier> → <state>" on success.
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--issue':
        args.issue = value;
        i += 2;
        break;
      case '--state':
        args.state = value;
        i += 2;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        process.exit(1);
    }
  }
  return args;
}

async function main() {
  if (!LINEAR_API_KEY) {
    console.error('ERROR: LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }

  const args = parseArgs(process.argv);

  if (!args.issue) {
    console.error('ERROR: --issue is required (e.g. --issue ANQ-106)');
    process.exit(1);
  }
  if (!args.state) {
    console.error('ERROR: --state is required (e.g. --state "In Progress")');
    process.exit(1);
  }

  const gql = createGql(LINEAR_API_KEY);

  // Resolve issue and its team
  const issueData = await gql(
    `query($id: String!) { issue(id: $id) { id identifier team { id } } }`,
    { id: args.issue }
  );
  if (!issueData.issue) {
    console.error(`ERROR: Issue ${args.issue} not found`);
    process.exit(1);
  }
  const issue = issueData.issue;
  const teamId = issue.team.id;

  // Resolve state by name
  const teamData = await gql(
    `query($teamId: String!) { team(id: $teamId) { states(first: 50) { nodes { id name } } } }`,
    { teamId }
  );
  const state = teamData.team.states.nodes.find(
    (s) => s.name.toLowerCase() === args.state.toLowerCase()
  );
  if (!state) {
    const available = teamData.team.states.nodes.map((s) => s.name).join(', ');
    console.error(`ERROR: State '${args.state}' not found. Available: ${available}`);
    process.exit(1);
  }

  // Update issue state
  const result = await gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { identifier state { name } } }
    }`,
    { id: issue.id, input: { stateId: state.id } }
  );

  const updated = result.issueUpdate?.issue;
  if (updated) {
    console.log(`${updated.identifier} → ${updated.state.name}`);
  } else {
    console.error('ERROR: Failed to update issue state');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
