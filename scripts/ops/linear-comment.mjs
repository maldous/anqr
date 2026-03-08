#!/usr/bin/env node

/**
 * Post a comment on a Linear issue.
 *
 * Designed to be called by AI agents instead of writing raw GraphQL mutations.
 *
 * Usage:
 *   node scripts/ops/linear-comment.mjs --issue ANQ-106 --body "Evidence: commit abc123"
 *
 * Options:
 *   --issue <ID>    Issue identifier (e.g. ANQ-106) — required
 *   --body <text>   Comment body (Markdown supported) — required
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Output: prints "Comment posted on <identifier>" on success.
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
      case '--body':
        args.body = value;
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
  if (!args.body) {
    console.error('ERROR: --body is required');
    process.exit(1);
  }

  const gql = createGql(LINEAR_API_KEY);

  // Resolve issue ID from identifier
  const issueData = await gql(`query($id: String!) { issue(id: $id) { id identifier } }`, {
    id: args.issue,
  });
  if (!issueData.issue) {
    console.error(`ERROR: Issue ${args.issue} not found`);
    process.exit(1);
  }

  // Post comment
  const result = await gql(
    `mutation($input: CommentCreateInput!) {
      commentCreate(input: $input) { success }
    }`,
    { input: { issueId: issueData.issue.id, body: args.body } }
  );

  if (result.commentCreate?.success) {
    console.log(`Comment posted on ${issueData.issue.identifier}`);
  } else {
    console.error('ERROR: Failed to post comment');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
