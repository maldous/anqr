#!/usr/bin/env node

/**
 * create-stream-no-content-issue.mjs — Create Linear issue to investigate streams completing with no content and null finish_reason
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Stream completes with no content and finish_reason: null",
  description: `## Problem

Streaming responses occasionally complete successfully (no errors thrown) but produce:
- **Zero text content** (fullText empty or whitespace-only)
- **finish_reason: null** instead of "stop", "length", "tool-calls", or "error"

This indicates the stream terminated abnormally without signaling why, leaving the consumer with no output and no actionable error.

**Observable symptoms:**
- Stream processing loop completes normally (no exceptions)
- \`fullText\` is empty or contains only whitespace
- \`finishReason === null\` (never set by any event)
- No \`finish\` event received, or finish event had \`finishReason: null\`
- May or may not have received any \`text-delta\` events

**Evidence from codebase:**
- \`symphony-openai-bridge.mjs\` lines ~2000-2100: streaming loop via \`result.fullStream\`
- Lines ~2085-2090: check for empty content and null finish_reason after stream completes
- Current error: \`Stream completed but produced no content (finishReason: null)\`

## Possible Root Causes

1. **Provider-side stream termination**: The upstream provider (Codebuff, Groq, Gemini, OpenRouter, etc.) closes the SSE connection without sending a final chunk or finish event.

2. **AI SDK buffering issue**: The AI SDK's \`streamText\` may buffer events and fail to flush them if the provider stream ends prematurely.

3. **Network interruption**: Connection drops after the stream starts but before any content is delivered.

4. **Provider API error with 200 status**: Some providers return HTTP 200 with an error embedded in the response body (e.g., JSON error object instead of SSE chunks).

5. **Tool execution failure**: If tools are enabled and the first tool call fails critically, the stream may terminate without emitting text-delta events.

6. **Event type mismatch**: The provider emits events in a format the AI SDK doesn't recognize, so no \`text-delta\` or \`finish\` events are generated.

7. **Transparent relay issue (Codebuff-specific)**: The transparent SSE relay in \`invokeCodebuffDirectStream\` may have edge cases where the upstream connection closes without sending \`[DONE]\`.

## Investigation Steps

1. **Add detailed event logging**: Instrument the streaming loop to log ALL event types received, including unrecognized ones. Capture the raw SSE chunks before AI SDK parsing.

2. **Check provider-specific behavior**: Run identical prompts through different providers and compare:
   - Which providers exhibit the null finish_reason behavior?
   - Do they consistently fail, or is it intermittent (network/load-related)?

3. **Inspect raw SSE streams**: For providers that fail, capture the raw SSE response (before AI SDK processing) to see if finish events are actually being sent.

4. **Review AI SDK version and configuration**: Check if \`compatibility: "compatible"\` mode affects finish_reason handling. Review AI SDK changelog for related bugs.

5. **Test with tools disabled**: Run the same request with \`useTools: false\` to rule out tool-execution-related stream termination.

6. **Check for embedded errors**: After stream completes with null finish_reason, inspect \`result.response\` for embedded error symbols or metadata.

7. **Validate transparent relay**: For Codebuff, add logging to \`invokeCodebuffDirectStream\` to track:
   - Whether \`[DONE]\` chunk is received
   - Whether \`finish_reason\` is set in any chunk
   - Whether the upstream connection closes cleanly

## Expected Behavior

For ALL providers and ALL streaming scenarios:
- Every stream MUST emit at least one \`finish\` event with a non-null \`finishReason\`
- Valid finish reasons: \`"stop"\`, \`"length"\`, \`"tool-calls"\`, \`"error"\`
- If the provider fails, an \`error\` event should be emitted
- Empty content is acceptable ONLY if \`finishReason === "error"\` or an explicit error event occurred

## Acceptance Criteria

- [ ] Identify which providers/scenarios trigger null finish_reason
- [ ] Determine root cause (provider bug, AI SDK bug, network issue, etc.)
- [ ] Add instrumentation to detect and log this condition earlier (before the final check)
- [ ] Either fix the issue OR add a provider-specific workaround
- [ ] Update error handling to provide more actionable diagnostics when this occurs
- [ ] Add tests to validate finish_reason is always set for all providers

## Technical Context

**Files to investigate:**
- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` (main streaming logic)
  - Lines ~2000-2100: \`for await (const part of result.fullStream)\`
  - Lines ~2085-2090: null finish_reason check
  - Line ~2028: \`onFinish\` callback (logs finish_reason)
- \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\` (Codebuff transparent relay)
- \`tests/integration/harness-bridge-validate-streaming.ts\` (streaming contract validation)

**Key code sections:**
- Stream processing loop: handles \`text-delta\`, \`reasoning-delta\`, \`tool-call\`, \`tool-result\`, \`error\`, \`finish\` events
- \`onFinish\` callback: logs finish_reason but may not be called if provider doesn't emit finish event
- Final validation: throws error if \`!fullText && finishReason !== "tool-calls"\`

**Diagnostic questions:**
1. Is \`onFinish\` callback being invoked? (Check logs for "Stream finished" message)
2. Are ANY events being emitted during the stream? (Check \`partCount\`, \`textDeltaCount\`)
3. Does this happen with specific providers or all of them?
4. Does it correlate with specific request types (long context, tool-heavy, etc.)?

## Related Issues

- May be related to provider-specific streaming formats (some providers don't emit standard finish events)
- Could affect user experience if retries don't handle this case properly
- May indicate broader AI SDK compatibility issues with third-party providers

## Priority Justification

**Priority 2 (High)**: This causes silent failures where the user gets no response and no clear error. While auto-fallback may retry with another provider, debugging is difficult without knowing which provider/scenario triggered it.

**Estimate**: 3-5 points
- 2 points: Add instrumentation and reproduce the issue
- 1-2 points: Root cause analysis (provider vs AI SDK vs network)
- 1 point: Implement fix or workaround + tests
`,
  stateId: STATES.backlog,
  labelIds: [LABELS.bug, LABELS.reliability],
  priority: 2, // High priority - silent failures are hard to debug
  estimate: 4, // 3-5 story points
};

async function main() {
  console.log("Creating Linear issue for stream no-content investigation...\n");

  try {
    const issue = await createIssue(issueInput);

    console.log(`✅ Created: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority} | Estimate: ${issue.estimate} points`);
    console.log(`   Labels: ${issue.labels.nodes.map((l) => l.name).join(", ")}`);
    console.log("\n✅ Issue created successfully!");
    console.log(
      "\nNext steps: Instrument symphony-openai-bridge.mjs streaming loop to log all event types and capture scenarios where finish_reason is null.",
    );
  } catch (err) {
    console.error(`❌ Failed to create issue: ${err.message}`);
    process.exit(1);
  }
}

await main();
