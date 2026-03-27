#!/usr/bin/env node

/**
 * update-anq-1063.mjs
 * 
 * Updates ANQ-1063 to reflect that this is an OpenClaw Gateway integration issue,
 * not a Codebuff SDK bug.
 */

import { query, updateIssue, TEAM_ID } from "./linear-client.mjs";

const NEW_TITLE = "OpenClaw Integration Bug: run_file_change_hooks parameter validation error";

const NEW_DESCRIPTION = `## Summary

Something in the OpenClaw/client stack is calling \`run_file_change_hooks\` with incorrect parameter type - passing a string instead of an array for the \`files\` parameter.

## Error Message

\`\`\`
❌ Error: Invalid parameters for run_file_change_hooks: [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": [
      "files"
    ],
    "message": "Invalid input: expected array, received string"
  }
]
\`\`\`

## Root Cause

The issue originates from the OpenClaw Gateway or client stack when invoking \`run_file_change_hooks\`. The bug is:
- **Actual (incorrect)**: \`{ files: "single-file.ts" }\` ❌
- **Expected (correct)**: \`{ files: ["single-file.ts"] }\` ✅

## Investigation Results

1. **Tool definition**: Defined in \`.agents/types/tools.types.ts\`:
   \`\`\`typescript
   export interface RunFileChangeHooksParams {
     /** List of file paths that were changed and should trigger file change hooks */
     files: string[];
   }
   \`\`\`

2. **Not called in ANQR codebase**: The tool is never invoked anywhere in our code - this comes from OpenClaw

3. **OpenClaw integration layer**: The error occurs when OpenClaw/client calls the Symphony bridge's \`run_file_change_hooks\` tool

## Scope Class

\`ops-incident\`

## Owned Surfaces

- Harness runtime (affected by integration errors)
- Symphony bridge (receives malformed requests)
- Error logging and monitoring

## Constraints

- **External dependency**: Bug is in OpenClaw Gateway or client, not ANQR code
- **Integration boundary**: Occurs at the OpenClaw → Symphony bridge interface
- **Non-blocking**: Doesn't prevent core functionality, but causes noise in logs

## Definition Of Done

- [ ] Report bug to OpenClaw maintainers with reproduction details
- [ ] Add parameter normalization in Symphony bridge as workaround (accept string or array)
- [ ] Document error in knowledge base as known integration issue
- [ ] Monitor for OpenClaw version with fix
- [ ] Test fix when available
- [ ] Remove workaround once upstream is fixed

## Verification

\`\`\`bash
# Confirm error still occurs
grep "run_file_change_hooks" reports/runtime-events.log || echo "No recent errors"

# After fix, verify error is resolved
grep "run_file_change_hooks" reports/runtime-events.log | tail -5
\`\`\`

## Evidence Payload

- **Error frequency**: Occurring regularly during file modifications via OpenClaw
- **Impact**: Logging noise, no functional impact
- **Integration layer**: OpenClaw Gateway → Symphony Bridge
- **Reproduction**: Make file changes through OpenClaw while Symphony bridge is running

## Recommended Fix

Add parameter normalization in Symphony bridge:

\`\`\`javascript
run_file_change_hooks: tool({
  description: "Execute file change hooks after file modifications",
  parameters: z.object({
    files: z.union([z.string(), z.array(z.string())]).transform(val => 
      Array.isArray(val) ? val : [val]
    ),
  }),
  execute: async ({ files }) => {
    // files is now always an array
    // ... execute hooks
  },
}),
\`\`\`

## Escalate If

- Error frequency increases significantly
- Functional impact discovered (file change hooks not executing)
- OpenClaw maintainers cannot reproduce or need additional details

## Follow-up Work

- Monitor OpenClaw Gateway releases for fix
- Consider adding defensive parameter normalization across all bridge tools
- Add integration test for parameter validation
`;

async function main() {
  console.log(`Looking up ANQ-1063...`);

  // Find the issue by identifier
  const result = await query(
    `query($teamId: String!) {
      team(id: $teamId) {
        issues(filter: { number: { eq: 1063 } }) {
          nodes {
            id
            identifier
            title
            description
          }
        }
      }
    }`,
    { teamId: TEAM_ID },
  );

  const issue = result.team.issues.nodes[0];
  if (!issue) {
    console.error("❌ Issue ANQ-1063 not found");
    process.exit(1);
  }

  console.log(`Found issue: ${issue.identifier} — ${issue.title}`);
  console.log(`\nUpdating to reflect OpenClaw integration bug...`);

  const updated = await updateIssue(issue.id, {
    title: NEW_TITLE,
    description: NEW_DESCRIPTION,
  });

  console.log(`✅ Updated issue: ${updated.identifier} — ${updated.title}`);
  console.log(`   URL: https://linear.app/anqr/issue/${updated.identifier}`);
  console.log(`   State: ${updated.state.name}`);
  console.log(`   Labels: ${updated.labels.nodes.map((l) => l.name).join(", ")}`);

  return updated;
}

try {
  await main();
} catch (err) {
  console.error(`❌ Failed to update issue: ${err.message}`);
  process.exit(1);
}
