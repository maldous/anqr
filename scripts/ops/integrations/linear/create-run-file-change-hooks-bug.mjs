#!/usr/bin/env node

/**
 * create-run-file-change-hooks-bug.mjs
 * 
 * Raises Linear issue for Codebuff SDK bug: run_file_change_hooks receiving
 * string instead of array for files parameter.
 */

import { createIssue, LABELS, STATES } from "./linear-client.mjs";

const TITLE = "Codebuff SDK Bug: run_file_change_hooks parameter validation error";

const DESCRIPTION = `## Summary

Codebuff SDK is calling \`run_file_change_hooks\` with incorrect parameter type - passing a string instead of an array for the \`files\` parameter.

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

The Codebuff SDK internally invokes \`run_file_change_hooks\` when files are modified. There's a bug where:
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

2. **Not called in ANQR codebase**: The tool is never invoked anywhere in our code - this is purely SDK-internal

3. **No local codebuff.json**: No file change hooks configured in this repository

4. **User config**: \`~/.codebuff/config.yaml\` only has provider settings, no file change hooks

## Scope Class

\`ops-incident\`

## Owned Surfaces

- Harness runtime (affected by SDK errors)
- Error logging and monitoring

## Constraints

- **External dependency**: Bug is in Codebuff SDK, not ANQR code
- **No immediate workaround**: Requires SDK fix or update
- **Non-blocking**: Doesn't prevent core functionality, but causes noise in logs

## Definition Of Done

- [ ] Report bug to Codebuff SDK maintainers with reproduction details
- [ ] Document error in knowledge base as known external issue
- [ ] Monitor for SDK version with fix
- [ ] Test fix when available
- [ ] Update to fixed SDK version

## Verification

\`\`\`bash
# Confirm error still occurs
grep "run_file_change_hooks" reports/runtime-events.log || echo "No recent errors"

# After SDK update, verify error is resolved
npm list @codebuff/sdk
grep "run_file_change_hooks" reports/runtime-events.log | tail -5
\`\`\`

## Evidence Payload

- **Error frequency**: Occurring regularly during file modifications
- **Impact**: Logging noise, no functional impact
- **Touched paths**: None (external SDK bug)
- **SDK version**: Check \`package.json\` for \`@codebuff/sdk\` version
- **Reproduction**: Make file changes while Codebuff bridge is running

## Escalate If

- Error frequency increases significantly
- Functional impact discovered (file change hooks not executing)
- SDK maintainers request additional reproduction details

## Follow-up Work

- Monitor Codebuff SDK releases for fix
- Consider disabling file change hooks if available and causing issues
- Add retry logic or parameter normalization if SDK fix is delayed
`;

async function main() {
  console.log(`Creating Linear issue: "${TITLE}"...`);

  const issue = await createIssue({
    title: TITLE,
    description: DESCRIPTION,
    stateId: STATES.todo,
    labelIds: [LABELS.harness],
    priority: 3, // Medium priority - causes noise but not blocking
  });

  console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
  console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
  console.log(`   State: ${issue.state.name}`);
  console.log(`   Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
  
  return issue;
}

main().catch((err) => {
  console.error(`❌ Failed to create issue: ${err.message}`);
  process.exit(1);
});
