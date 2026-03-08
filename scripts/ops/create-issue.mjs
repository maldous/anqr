#!/usr/bin/env node

/**
 * Create a standalone Linear issue from the command line.
 *
 * Designed to be called by AI agents (Symphony/Codex/Codebuff) instead of
 * writing raw GraphQL mutations, which small models frequently get wrong.
 *
 * Usage:
 *   node scripts/ops/create-issue.mjs \
 *     --title "Add iOS AdMob ad unit IDs" \
 *     --description "Detailed description" \
 *     --priority 2 \
 *     --label ads \
 *     --label ios
 *
 * Options:
 *   --title <text>        Issue title — required
 *   --description <text>  Issue description (default: empty)
 *   --priority <1-4>      Priority: 1=urgent, 2=high, 3=medium, 4=low (default: 3)
 *   --label <name>        Label name (repeatable, e.g. --label reliability --label web)
 *   --project <name>      Project name (default: none)
 *   --state <name>        Initial state (default: Backlog)
 *   --team <key>          Team key (default: ANQ)
 *   --parent <ID>         Optional parent issue identifier (e.g. ANQ-151)
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: prints the created issue identifier (e.g. ANQ-245) on success.
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

function parseArgs(argv) {
  const args = { labels: [] };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--title':
        args.title = value;
        i += 2;
        break;
      case '--description':
        args.description = value;
        i += 2;
        break;
      case '--priority':
        args.priority = Number(value);
        i += 2;
        break;
      case '--label':
        args.labels.push(value);
        i += 2;
        break;
      case '--project':
        args.project = value;
        i += 2;
        break;
      case '--state':
        args.state = value;
        i += 2;
        break;
      case '--team':
        args.team = value;
        i += 2;
        break;
      case '--parent':
        args.parent = value;
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

  if (!args.title) {
    console.error('ERROR: --title is required');
    process.exit(1);
  }

  const priority = args.priority || 3;
  const description = args.description || '';
  const stateName = args.state || 'Backlog';
  const teamKey = args.team || 'ANQ';

  const gql = createGql(LINEAR_API_KEY);

  // Resolve team by key
  const teamLookup = await gql(
    `query($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 1) {
        nodes { id }
      }
    }`,
    { key: teamKey }
  );
  const teamId = teamLookup.teams.nodes[0]?.id;
  if (!teamId) {
    console.error(`ERROR: Team '${teamKey}' not found`);
    process.exit(1);
  }

  // Resolve team labels, states, projects
  const teamData = await gql(
    `query($teamId: String!) {
      team(id: $teamId) {
        labels(first: 200) { nodes { id name } }
        states(first: 50) { nodes { id name } }
        projects(first: 50) { nodes { id name } }
      }
    }`,
    { teamId }
  );
  const team = teamData.team;

  // Resolve label IDs
  const labelIds = [];
  for (const labelName of args.labels) {
    const label = team.labels.nodes.find((l) => l.name.toLowerCase() === labelName.toLowerCase());
    if (label) {
      labelIds.push(label.id);
    } else {
      console.error(`WARNING: Label '${labelName}' not found, skipping`);
    }
  }

  // Resolve state ID
  const state = team.states.nodes.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  if (!state) {
    console.error(`ERROR: State '${stateName}' not found`);
    process.exit(1);
  }

  // Resolve project ID (optional)
  let projectId = undefined;
  if (args.project) {
    const project = team.projects.nodes.find(
      (p) => p.name.toLowerCase() === args.project.toLowerCase()
    );
    if (project) {
      projectId = project.id;
    } else {
      console.error(`WARNING: Project '${args.project}' not found, skipping`);
    }
  }

  // Resolve parent issue ID (optional)
  let parentId = undefined;
  if (args.parent) {
    const parentData = await gql(
      `query($id: String!) { issue(id: $id) { id identifier } }`,
      { id: args.parent }
    );
    if (!parentData.issue) {
      console.error(`ERROR: Parent issue '${args.parent}' not found`);
      process.exit(1);
    }
    parentId = parentData.issue.id;
  }

  // Create the issue
  const input = {
    teamId,
    title: args.title,
    description,
    priority,
    stateId: state.id,
    ...(labelIds.length > 0 ? { labelIds } : {}),
    ...(projectId ? { projectId } : {}),
    ...(parentId ? { parentId } : {}),
  };

  const result = await gql(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { identifier title } }
    }`,
    { input }
  );

  const created = result.issueCreate?.issue;
  if (created) {
    console.log(created.identifier);
  } else {
    console.error('ERROR: Failed to create issue');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
