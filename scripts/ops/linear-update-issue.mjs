#!/usr/bin/env node

/**
 * Update fields on a Linear issue.
 *
 * Designed to be called by AI agents for bulk-update tasks (e.g. title
 * normalization, priority triage) without constructing raw GraphQL.
 *
 * Usage:
 *   node scripts/ops/linear-update-issue.mjs --issue ANQ-106 --title "[LOCAL-SLICE] New title"
 *   node scripts/ops/linear-update-issue.mjs --issue ANQ-106 --priority 2 --label reliability --label web
 *   node scripts/ops/linear-update-issue.mjs --issue ANQ-106 --description "Updated scope..."
 *
 * Options:
 *   --issue <ID>           Issue identifier (e.g. ANQ-106) — required
 *   --title <text>         New title
 *   --description <text>   New description
 *   --priority <1-4>       Priority: 1=urgent, 2=high, 3=medium, 4=low
 *   --label <name>         Set labels (repeatable; replaces all existing labels)
 *   --add-label <name>     Add a label without removing existing ones (repeatable)
 *   --state <name>         Move to a state (same as linear-update-state.mjs)
 *
 * At least one field flag is required.
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: prints "<identifier> updated (<fields>)" on success.
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

function parseArgs(argv) {
  const args = { labels: [], addLabels: [] };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--issue':
        args.issue = value;
        i += 2;
        break;
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
      case '--add-label':
        args.addLabels.push(value);
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

  const hasUpdate =
    args.title !== undefined ||
    args.description !== undefined ||
    args.priority !== undefined ||
    args.labels.length > 0 ||
    args.addLabels.length > 0 ||
    args.state !== undefined;

  if (!hasUpdate) {
    console.error(
      'ERROR: At least one field flag is required (--title, --description, --priority, --label, --add-label, --state)'
    );
    process.exit(1);
  }

  const gql = createGql(LINEAR_API_KEY);

  // Resolve issue and team
  const issueData = await gql(
    `query($id: String!) {
      issue(id: $id) {
        id identifier
        team { id }
        labels { nodes { id name } }
      }
    }`,
    { id: args.issue }
  );
  if (!issueData.issue) {
    console.error(`ERROR: Issue ${args.issue} not found`);
    process.exit(1);
  }
  const issue = issueData.issue;
  const teamId = issue.team.id;

  // Build update input
  const input = {};
  const updatedFields = [];

  if (args.title !== undefined) {
    input.title = args.title;
    updatedFields.push('title');
  }

  if (args.description !== undefined) {
    input.description = args.description;
    updatedFields.push('description');
  }

  if (args.priority !== undefined) {
    input.priority = args.priority;
    updatedFields.push('priority');
  }

  // Resolve state if provided
  if (args.state !== undefined) {
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
    input.stateId = state.id;
    updatedFields.push('state');
  }

  // Resolve labels if provided
  if (args.labels.length > 0 || args.addLabels.length > 0) {
    const teamData = await gql(
      `query($teamId: String!) { team(id: $teamId) { labels(first: 200) { nodes { id name } } } }`,
      { teamId }
    );
    const allLabels = teamData.team.labels.nodes;

    if (args.labels.length > 0) {
      // Replace all labels
      const labelIds = [];
      for (const name of args.labels) {
        const label = allLabels.find((l) => l.name.toLowerCase() === name.toLowerCase());
        if (label) {
          labelIds.push(label.id);
        } else {
          console.error(`WARNING: Label '${name}' not found, skipping`);
        }
      }
      input.labelIds = labelIds;
      updatedFields.push('labels');
    } else if (args.addLabels.length > 0) {
      // Merge with existing labels
      const existingIds = issue.labels.nodes.map((l) => l.id);
      const newIds = [...existingIds];
      for (const name of args.addLabels) {
        const label = allLabels.find((l) => l.name.toLowerCase() === name.toLowerCase());
        if (label && !newIds.includes(label.id)) {
          newIds.push(label.id);
        } else if (!label) {
          console.error(`WARNING: Label '${name}' not found, skipping`);
        }
      }
      input.labelIds = newIds;
      updatedFields.push('labels');
    }
  }

  // Apply update
  const result = await gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { identifier title state { name } } }
    }`,
    { id: issue.id, input }
  );

  const updated = result.issueUpdate?.issue;
  if (updated) {
    console.log(`${updated.identifier} updated (${updatedFields.join(', ')})`);
  } else {
    console.error('ERROR: Failed to update issue');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
