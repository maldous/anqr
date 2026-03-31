#!/usr/bin/env node

/**
 * create-systemd-env-directive-issue.mjs — Create Linear issue for invalid Environment directive
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Fix invalid Environment directive in anqr-discord-bridge@.service",
  description: `## Problem

The systemd service file \`anqr-discord-bridge@.service\` line 39 has an invalid environment assignment:

\`\`\`
Environment=DISCORD_BOT_TOKEN
\`\`\`

This causes systemd to log a warning:
\`\`\`
/home/user/.config/systemd/user/anqr-discord-bridge@.service:39: Invalid environment assignment, ignoring: DISCORD_BOT_TOKEN
\`\`\`

## Root Cause

Systemd \`Environment=\` directives require a value assignment in the format \`VAR=value\`. The current line 39 attempts to declare an environment variable without a value, which is invalid syntax.

**Intent**: The variable should be sourced from the \`EnvironmentFile\` directives (lines 56-57) that load \`anqr-ops.env\` and \`anqr.env\`.

**Issue**: Declaring it as \`Environment=DISCORD_BOT_TOKEN\` (no value) is not valid systemd syntax and causes the warning.

## Additional Issues

Line 85 in \`anqr-ops.env\` also has a duplicate/empty declaration:
\`\`\`
DISCORD_BOT_TOKEN=
\`\`\`

This is valid syntax (empty string value) but appears twice in the file (lines 32 and 85), which is redundant.

## Solution

1. **Remove line 39** from \`services/systemd/anqr-discord-bridge@.service\`:
   \`\`\`diff
   - Environment=DISCORD_BOT_TOKEN
   \`\`\`

2. **Clean up \`anqr-ops.env\`** — remove duplicate empty declaration at line 85:
   \`\`\`diff
   - DISCORD_BOT_TOKEN=
   \`\`\`

The variable will still be available to the service from the \`EnvironmentFile\` directive as long as it's defined in the env file with a real token value.

## Impact

- **Severity**: P3 (minor) — warning only, doesn't prevent service operation
- Creates noise in systemd journal logs
- May confuse operators debugging environment variable issues

## Acceptance Criteria

- [ ] Remove \`Environment=DISCORD_BOT_TOKEN\` from \`anqr-discord-bridge@.service\` line 39
- [ ] Remove duplicate \`DISCORD_BOT_TOKEN=\` entry from \`anqr-ops.env\` line 85
- [ ] Verify no systemd warnings after \`systemctl --user daemon-reload\`
- [ ] Verify service still loads \`DISCORD_BOT_TOKEN\` from env file correctly

## Files to Update

- \`services/systemd/anqr-discord-bridge@.service\` (remove line 39)
- \`services/systemd/anqr-ops.env\` (remove line 85 duplicate)

## References

- Systemd Environment directive docs: https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Environment=
- Service file: \`services/systemd/anqr-discord-bridge@.service\`
- Env template: \`services/systemd/anqr-ops.env\``,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.hygiene],
  priority: 3, // P3 - minor warning
  estimate: 1,
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
