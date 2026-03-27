#!/usr/bin/env node

/**
 * create-cerebras-journalctl-issue.mjs — Report Cerebras hallucinating file read when asked to review journalctl logs
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issue = {
  title: "Cerebras hallucinated file read command instead of checking systemd service logs",
  description: `## Summary

Cerebras provider hallucinated a \`read\` command to read \`/tmp/errors.json\` when asked to review journalctl logs for systemd services.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Symphony bridge provider routing
- Model capability validation
- Provider tier classification

## Observed Behavior

**User request (Mar 27, 18:25)**:
> review the journalctl --user logs for anqr-codebuff-bridge.service anqr-context7-mcp.service anqr-email-ingest.service anqr-nightly.service anqr-queue-feeder.service anqr-rag-rebuild.service anqr-symphony-bridge.service anqr-symphony-runner.service anqr-watchdog.service anqr-email-ingest.timer anqr-nightly.timer anqr-queue-feeder.timer anqr-rag-rebuild.timer anqr-symphony-runner.timer and determine if there are issues

**Cerebras response**:
\`\`\`json
{
  "name": "read",
  "arguments": {
    "path": "/tmp/errors.json",
    "offset": 0,
    "lines": 10
  }
}
\`\`\`

## Root Cause Analysis

1. **Tool Schema Confusion**: Cerebras selected a \`read\` tool that doesn't exist in the available tool schema
2. **Incorrect Path**: Hallucinated \`/tmp/errors.json\` file that was never mentioned
3. **Ignored Context**: Completely ignored the explicit request to check journalctl logs for systemd services
4. **Tier Classification**: Cerebras routed for a request requiring system inspection capabilities

## Constraints

- Cerebras is explicitly documented as "neither a paid nor preferred service provider" (knowledge.md)
- Groq has known mid-conversation switching issues (Mar 27, 2026)
- Provider routing uses dynamic tool-capability probing
- Safety-net providers have score ceiling of 0.25

## Expected Behavior

1. Model should invoke terminal command: \`journalctl --user -u anqr-codebuff-bridge.service -n 100\` (and similar for other services)
2. Tool-bearing requests should route to providers with validated structured tool support
3. Hallucinated commands should trigger provider degradation/cooldown

## Definition Of Done

- [ ] Verify Cerebras tier classification and tool support
- [ ] Add test case for journalctl inspection requests
- [ ] Implement hallucination detection (non-existent tool names or paths)
- [ ] Document Cerebras limitations in provider config
- [ ] Consider excluding Cerebras from harness/ops requests requiring system inspection

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:e2e -- openclaw-symphony.spec.ts
node scripts/ops/integrations/model/symphony-provider-health.mjs
\`\`\`

## Evidence Payload

- Cerebras provider config and tier assignment
- Tool schema provided to Cerebras at request time
- Provider selection logs showing why Cerebras was chosen
- Any other instances of tool hallucination from Cerebras
- Comparison with correct provider behavior (expected: run_terminal_command for journalctl)

## Escalate If

- Cerebras is being routed for paid/critical requests (violates policy)
- Other providers showing similar tool hallucination patterns
- Tool schema validation is insufficient across all providers

## Follow-up Work

- Related to existing issue about Cerebras hallucinating \`task_complete\` command
- Consider consolidating Cerebras reliability issues into single tracking issue
- Audit other safety-net tier providers for tool reliability
- Add telemetry for tool hallucination detection
`,
  priority: 2, // Medium-high - affects reliability but has fallbacks
  estimate: 3,
};

async function main() {
  console.log("Creating Cerebras journalctl hallucination issue...\n");

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
