#!/usr/bin/env node

/**
 * create-discord-lightbulb-issue.mjs — Create Linear issue to remove single line light bulb results from thinking presented to discord
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Remove single line light bulb (💡) from thinking output sent to Discord",
  description: `## Problem

In the thinking stream presented to Discord via the webhook integration, single line light bulb emojis (💡) appear as part of the output (e.g., from follow‑up suggestions or think_deeply tool). These emit noisy, non‑informative messages that clutter the Discord channel.

**Examples of where the light bulb is added:**
- In \`symphony-openai-bridge.mjs\` line ~2856: \`onChunk({ type: "text", text: "\\n💡 " })\`
- In \`codebuff-openai-bridge.mjs\` there is a filter \`if (trimmed && trimmed !== "💡")\` indicating the bulb is considered unwanted.

## Root Cause

The bridges intentionally insert a light bulb emoji when streaming thinking steps to the UI, but this same stream is also piped to Discord notifications, causing the bulb to appear as a standalone line in chat.

## Solution

Strip or avoid sending the light bulb emoji when the destination is Discord. Options:
1. Modify the streaming logic in the bridges to not include the bulb when the requestId indicates a Discord webhook (or when streaming to notifications).
2. Add a filter in the Discord webhook stream handler to remove lines that consist solely of the bulb emoji (or a newline plus bulb).
3. Alternatively, change the bulb to be logged only (via \`logInfo\`) and not included in the streamed text.

## Acceptance Criteria

- [ ] No single line containing only \\(\\text{💡}\\) (or \\(\\n💡\\) ) appears in Discord messages originating from thinking streams.
- [ ] The light bulb may still appear in logs or other non‑Discord outputs for observability.
- [ ] Existing functionality for think_deeply and follow‑up suggestions remains intact.
- [ ] Unit/manual tests confirm Discord messages are free of the bulb emoji.

  `,
  stateId: STATES.backlog,
  labelIds: [LABELS.hygiene], // or bug? We'll use hygiene as it's a cleanup
  priority: 3, // P2
  estimate: 2,
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