#!/usr/bin/env node

/**
 * Create Linear issue to investigate streaming support across providers
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

async function main() {
  const title = "Investigate streaming support across providers";

  const description = `## Context

Currently, streaming responses are working for Codebuff provider, but we need to verify if streaming is properly implemented for other providers (Groq, Gemini, OpenRouter, etc.).

## Investigation Required

1. **Review streaming implementation** in \`symphony-openai-bridge.mjs\`:
   - Check if all providers route through AI SDK's \`streamText\`
   - Verify if Codebuff's transparent SSE relay bypass is unique
   - Identify any provider-specific streaming limitations

2. **Test streaming with non-Codebuff providers**:
   - Groq (known to support streaming)
   - Gemini/Gemini-lite
   - OpenRouter variants
   - Cerebras, SambaNova
   - Local Ollama

3. **Check for streaming-specific issues**:
   - Are reasoning-delta events being emitted for all providers?
   - Are text-delta events properly forwarded?
   - Do all providers handle tool execution during streaming?
   - Are there buffering issues with certain providers?

4. **Review diagnostic logging**:
   - Lines 2028-2045 show diagnostic logging for non-Codebuff providers
   - Check if this reveals streaming gaps
   - Verify \`reasoning-delta\` detection logic

## Evidence to Collect

- [ ] Log output from streaming requests with different providers
- [ ] Comparison of event types emitted by each provider
- [ ] Timing measurements (buffering delays vs real-time streaming)
- [ ] Discord streaming behavior with different providers

## Potential Fixes

If streaming gaps are found:

1. **Provider-specific adjustments**:
   - Add custom event handlers for providers with non-standard streaming
   - Implement fallback text extraction for buffered providers

2. **AI SDK configuration**:
   - Verify \`compatibility: "compatible"\` mode is set for all providers
   - Check if \`.chat()\` method is required for third-party APIs

3. **Discord streaming integration**:
   - Ensure \`onDiscordChunk\` callback works for all providers
   - Add provider-specific filtering if needed

## Success Criteria

- [ ] Document which providers support real-time streaming
- [ ] Identify any providers that buffer responses
- [ ] Fix any streaming gaps found
- [ ] Update \`discord-voice-integration.md\` if streaming behavior varies by provider

## References

- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` lines 2028-2045
- \`docs/harness/discord-voice-integration.md\`
- AI SDK documentation on streaming
`;

  const issue = await createIssue({
    title,
    description,
    stateId: STATES.todo,
    labelIds: [LABELS.harness], // Only use harness label (research may not exist)
    priority: 2, // Medium priority
  });

  console.log(`✅ Created issue: ${issue.identifier} - ${issue.title}`);
  console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
}

main().catch((err) => {
  console.error(`❌ Failed to create issue: ${err.message}`);
  process.exit(1);
});
