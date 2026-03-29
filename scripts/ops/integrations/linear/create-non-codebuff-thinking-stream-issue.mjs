#!/usr/bin/env node

/**
 * create-non-codebuff-thinking-stream-issue.mjs — Create Linear issue to investigate why non-Codebuff models don't stream thinking
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Non-Codebuff models don't stream thinking — only lightbulb shown at end",
  description: `## Problem

When using non-Codebuff models (Groq, Mistral, Gemini, OpenRouter, etc.) in the Symphony bridge, their thinking/reasoning output is not streamed in real-time. Instead, only a lightbulb emoji (💡) status indicator is visible during execution, and the full thinking content only appears at the end of the response.

This contrasts with Codebuff models, where thinking streams incrementally as it's generated.

**Observable symptoms:**
- Logs show that streaming messages ARE occurring for non-Codebuff models
- Only status indicator displayed to user/Discord is the lightbulb (💡)
- Full thinking content appears only after completion
- Real-time progress is not visible to the user

**Evidence from codebase:**
- \`symphony-openai-bridge.mjs\` handles streaming for all providers via AI SDK
- The bridge processes \`reasoning-start\`, \`reasoning-delta\`, and \`reasoning-end\` events from AI SDK
- Lines ~2856-2862 show reasoning deltas are forwarded via \`onChunk\`
- Discord streaming uses the same chunk flow via \`streamDiscordUpdate\`

## Possible Root Causes

1. **AI SDK buffering behavior**: The AI SDK may buffer reasoning/thinking deltas for non-Codebuff providers differently than for Codebuff's transparent SSE relay (which bypasses AI SDK entirely).

2. **Provider-specific streaming formats**: Non-Codebuff providers may not emit \`reasoning-delta\` events in their SSE streams — instead they might only return thinking in \`text-delta\` events or as final text.

3. **Event type filtering**: The streaming consumer may be filtering out or not properly handling the specific event types that non-Codebuff models use for thinking.

4. **Related to existing lightbulb issue**: May share root cause with ANQ-XXXX (Discord lightbulb cleanup issue) — both involve unwanted lightbulb-only status instead of actual content.

## Investigation Steps

1. **Instrument event logging**: Add detailed logging in \`symphony-openai-bridge.mjs\` streaming loop to capture exact event types and content for non-Codebuff providers (around lines 2000-2100).

2. **Compare event streams**: Run identical prompts through Codebuff (transparent relay) vs Groq/Mistral/Gemini (AI SDK) and diff the SSE events received.

3. **Check AI SDK documentation**: Verify which providers support \`reasoning-delta\` events vs only \`text-delta\`.

4. **Trace Discord notification flow**: Follow the path from \`onChunk\` → \`streamDiscordUpdate\` to confirm reasoning deltas reach Discord webhook.

5. **Review OpenClaw integration**: Check if \`.openclaw/models.json\` configuration affects streaming behavior for Symphony bridge models.

## Expected Behavior

For all providers (Codebuff and non-Codebuff):
- Thinking/reasoning should stream incrementally as it's generated
- Users should see real-time progress, not just a lightbulb
- Discord notifications should show thinking chunks as they arrive
- Final output should match what was streamed

## Acceptance Criteria

- [ ] Identify why non-Codebuff models don't emit real-time thinking deltas
- [ ] Document which providers support \`reasoning-delta\` vs only \`text-delta\`
- [ ] Either fix streaming to show real-time thinking OR document as provider limitation
- [ ] Update bridge logging to clearly distinguish buffered vs real-time streaming
- [ ] Add tests to validate streaming behavior across provider types
- [ ] Ensure Discord notifications show thinking progress (not just lightbulb) when available

## Related Issues

- Potentially related to Discord lightbulb cleanup issue (single-line 💡 appearing in output)
- May be connected to AI SDK version or configuration
- Could affect user experience significantly for long-running tasks

## Technical Context

**Files to investigate:**
- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` (main streaming logic)
- \`scripts/ops/integrations/notifications/discord-webhook.mjs\` (Discord streaming)
- \`tests/e2e/openclaw-helpers/send-streaming.ts\` (streaming test helpers)
- \`.openclaw/models.json\` (model configurations)

**Key code sections:**
- Lines ~2000-2100 in symphony-openai-bridge.mjs: \`for await (const part of result.fullStream)\`
- Lines ~2856-2862: reasoning-delta handling
- Lines ~3000+: Discord streaming integration
`,
  stateId: STATES.backlog,
  labelIds: [LABELS.bug],
  priority: 2, // P1 - affects user experience significantly
  estimate: 3,
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
    console.log(`   State: ${issue.state.name}`);
    console.log(`   Priority: P${issue.priority}`);
    console.log(`   Estimate: ${issue.estimate} points`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
