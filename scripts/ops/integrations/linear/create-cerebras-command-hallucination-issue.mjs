#!/usr/bin/env node

/**
 * create-cerebras-command-hallucination-issue.mjs — Report Cerebras hallucinating non-existent commands
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issue = {
  title: "Cerebras model hallucinating task_complete command and requesting absolute paths",
  description: `## Summary

Cerebras provider is hallucinating a non-existent \`task_complete\` command and requesting absolute paths that don't exist in the system.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Symphony bridge provider routing
- Model capability validation
- Provider tier classification

## Observed Behavior

Cerebras model output:
\`\`\`
It seems like the command \`task_complete\` is not recognized by the system. Let me try again using the absolute path to the script.
{"name": "exec", "arguments": "{\\"command\\":\\"/absolute/path/to/task_complete\\",\\"cwd\\":\\"anqr\\"}"}

However, I need the absolute path to the script \`task_complete\`. Can you please provide it?
\`\`\`

## Root Cause Analysis

1. **Tool Schema Confusion**: Cerebras is inventing a command that doesn't exist in the tool schema
2. **Path Hallucination**: Requesting absolute paths to non-existent scripts
3. **Tier Classification**: Cerebras is not a paid or preferred provider but may be incorrectly routed

## Constraints

- Cerebras is explicitly documented as "neither a paid nor preferred service provider" (knowledge.md)
- Provider routing uses dynamic tool-capability probing
- Safety-net providers have score ceiling of 0.25

## Expected Behavior

1. Cerebras should only be selected for non-critical, non-tool-bearing requests
2. Tool-bearing requests should route to providers with validated structured tool support
3. Hallucinated commands should trigger provider degradation/cooldown

## Definition Of Done

- [ ] Verify Cerebras tier classification in provider routing config
- [ ] Add tool-capability validation test for Cerebras
- [ ] Implement command hallucination detection in adaptive context
- [ ] Document known Cerebras limitations in provider config
- [ ] Consider adding to provider cooldown list or reducing score further

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:e2e -- openclaw-symphony.spec.ts
# Check provider routing logs for Cerebras selection criteria
node scripts/ops/integrations/model/symphony-provider-health.mjs
\`\`\`

## Evidence Payload

- Current Cerebras provider config and tier assignment
- Tool-capability probe results for Cerebras
- Provider selection logs showing why Cerebras was chosen
- Any other instances of command hallucination from Cerebras
- Recommended tier change or exclusion criteria

## Escalate If

- Cerebras is being routed for paid requests (violates policy)
- Other providers showing similar hallucination patterns
- Tool schema validation is insufficient across all providers

## Follow-up Work

- Audit other providers in safety-net tier for tool reliability
- Consider implementing stricter tool validation before routing
- Add telemetry for command hallucination detection
`,
  priority: 2, // Medium-high - affects reliability but has fallbacks
  estimate: 3,
};

async function main() {
  console.log("Creating Cerebras command hallucination issue...\n");

  try {
    const created = await createIssue({
      title: issue.title,
      description: issue.description,
      stateId: STATES.backlog,
      labelIds: [LABELS.harness],
      priority: issue.priority,
      estimate: issue.estimate,
    });

    console.log(`✅ Created: ${created.identifier} — ${created.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${created.identifier}`);
    console.log(`   Priority: P${created.priority} | Estimate: ${created.estimate} points\n`);
  } catch (err) {
    console.error(`❌ Failed to create issue: ${issue.title}`);
    console.error(`   Error: ${err.message}\n`);
    process.exit(1);
  }
}

await main();
