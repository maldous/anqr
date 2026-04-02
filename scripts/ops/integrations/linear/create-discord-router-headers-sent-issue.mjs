#!/usr/bin/env node

/**
 * create-discord-router-headers-sent-issue.mjs — Create Linear issue for Discord router ERR_HTTP_HEADERS_SENT
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Discord router: ERR_HTTP_HEADERS_SENT after proxy timeout",
  description: `## Summary

Discord router crashes with \`ERR_HTTP_HEADERS_SENT\` when attempting to send error response after proxy timeout has already triggered cleanup.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Discord request router (\`discord-request-router.mjs\`)
- Harness: Discord router systemd service (\`anqr-discord-router.service\`)

## Constraints

- **Architecture**: Router must handle proxy timeouts gracefully without crashing
- **Performance**: Error handling should not impact concurrent request handling
- **Reliability**: Service must stay running even when downstream worktrees timeout

## Problem Statement

Journal logs show router crashing when proxy timeout occurs:

\`\`\`
anqr-discord-router[1244799]: [discord-request-router.mjs:211] [ERROR] ❌ Proxy error to wt7: Proxy timeout
anqr-discord-router[1244799]: node:_http_server:366
anqr-discord-router[1244799]:     throw new ERR_HTTP_HEADERS_SENT('write');
anqr-discord-router[1244799]:     ^
anqr-discord-router[1244799]: Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client
anqr-discord-router[1244799]:     at ServerResponse.writeHead (node:_http_server:366:11)
anqr-discord-router[1244799]:     at ClientRequest.<anonymous> (file:///home/user/src/anqr/scripts/ops/integrations/model/discord-request-router.mjs:214:13)
anqr-discord-router[1244799]:     at ClientRequest.emit (node:events:508:20)
anqr-discord-router[1244799]:     at emitErrorEvent (node:_http_client:109:11)
anqr-discord-router[1244799]:     at Socket.socketErrorListener (node:_http_client:593:5)
anqr-discord-router[1244799]:     at Socket.emit (node:events:508:20)
anqr-discord-router[1244799]:     at emitErrorNT (node:internal/streams/destroy:170:8)
anqr-discord-router[1244799]:     at emitErrorCloseNT (node:internal/streams/destroy:129:3)
anqr-discord-router[1244799]:     at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
anqr-discord-router[1244799]:   code: 'ERR_HTTP_HEADERS_SENT'
anqr-discord-router[1244799]: }
anqr-discord-router[1244799]: Node.js v25.8.0
\`\`\`

**Impact:** Router crashes, requires systemd restart, Discord requests fail

## Root Cause

Race condition in proxy error handling:

1. Proxy request to worktree times out (120s)
2. Timeout handler calls \`proxyReq.destroy(new Error("Proxy timeout"))\`
3. This triggers socket error event
4. Socket error handler attempts \`res.writeHead(502, ...)\` at line 214
5. But timeout may have already sent partial response or headers
6. Node throws \`ERR_HTTP_HEADERS_SENT\` → process crashes

**Code location:** \`discord-request-router.mjs:211-214\`

\`\`\`javascript
proxyReq.on("error", (err) => {
  cleanup();
  logError(\`❌ Proxy error to wt\${worktree.id}: \${err.message}\`);

  if (!res.writableEnded) {  // Line 214 - race condition
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: { message: \`Worktree wt\${worktree.id} unavailable: \${err.message}\` },
      }),
    );
  }
});
\`\`\`

**Problem:** \`res.writableEnded\` check is insufficient. Need to also check \`res.headersSent\`.

## Investigation Path

### 1. Reproduce the Error

- [ ] Trigger proxy timeout (wait 120s or reduce timeout)
- [ ] Verify ERR_HTTP_HEADERS_SENT crash
- [ ] Check if headers were already sent

### 2. Review Response State Checks

- [ ] Audit all \`res.writeHead()\` calls in router
- [ ] Check if \`res.headersSent\` guard needed
- [ ] Verify \`res.writableEnded\` vs \`res.headersSent\` semantics

### 3. Test Timeout Scenarios

- [ ] Proxy timeout with no response started
- [ ] Proxy timeout with headers sent but body streaming
- [ ] Proxy timeout with response fully sent
- [ ] Multiple simultaneous timeouts

## Fix Strategy

### Option A: Add \`res.headersSent\` Check (Recommended)

\`\`\`javascript
proxyReq.on("error", (err) => {
  cleanup();
  logError(\`❌ Proxy error to wt\${worktree.id}: \${err.message}\`);

  // Only send error response if headers not yet sent
  if (!res.headersSent && !res.writableEnded) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: { message: \`Worktree wt\${worktree.id} unavailable: \${err.message}\` },
      }),
    );
  } else {
    // Headers already sent, just close the connection
    res.end();
  }
});
\`\`\`

**Pros:** Simple, prevents crash, safe
**Cons:** User may get partial response if headers were sent

### Option B: Wrap in Try-Catch

\`\`\`javascript
proxyReq.on("error", (err) => {
  cleanup();
  logError(\`❌ Proxy error to wt\${worktree.id}: \${err.message}\`);

  try {
    if (!res.writableEnded) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: { message: \`Worktree wt\${worktree.id} unavailable: \${err.message}\` },
        }),
      );
    }
  } catch (writeError) {
    // Headers already sent, just log and close
    logDebug(\`Cannot send error response (headers already sent): \${writeError.message}\`);
    if (!res.writableEnded) res.end();
  }
});
\`\`\`

**Pros:** Defensive, catches other write errors too
**Cons:** Hides errors, may mask other bugs

### Option C: Prevent Timeout Destroying Active Response Stream

- Add flag to track if response has started
- Only destroy proxy request if response not started
- Let active streams complete even after timeout

**Pros:** Better UX, completes partial responses
**Cons:** More complex, may delay cleanup

## Definition Of Done

- [ ] \`ERR_HTTP_HEADERS_SENT\` crash eliminated
- [ ] Router stays running through proxy timeouts
- [ ] Error responses sent correctly when possible
- [ ] No duplicate responses or headers
- [ ] Evidence document with before/after crash logs

## Verification

\`\`\`bash
# Trigger proxy timeout and verify no crash
# (Reduce timeout to 5s for testing)

# Check router stays running
systemctl --user status anqr-discord-router

# Verify no ERR_HTTP_HEADERS_SENT in logs
journalctl --user -u anqr-discord-router --since "1 hour ago" --no-pager | grep -c "ERR_HTTP_HEADERS_SENT"
# Should be 0

# Check proxy errors handled gracefully
journalctl --user -u anqr-discord-router --since "1 hour ago" --no-pager | grep "Proxy error"
# Should show errors but no crashes
\`\`\`

## Evidence Payload

- Summary: Discord router ERR_HTTP_HEADERS_SENT crash fix
- Scope class: docs-harness
- Touched paths: \`discord-request-router.mjs\`
- Decisions made: Add \`res.headersSent\` check before \`res.writeHead()\`
- Commands run: Timeout testing, crash verification
- Pass/fail result: 0 crashes after proxy timeout
- Risk: Medium - affects router stability
- Follow-up work: Review other response state checks, add timeout tests

## Related Issues

- Discord router OOM kills (separate issue)
- Proxy timeout duration (120s may be too long)
- Worktree health checks (detect hung bridges earlier)`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness],
  priority: 1, // P1 - service crashes
  estimate: 1, // Quick fix
};

async function main() {
  try {
    const issue = await createIssue(issueInput);
    console.log(`✅ Created issue: ${issue.identifier} — ${issue.title}`);
    console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
  } catch (err) {
    console.error("❌ Failed to create issue:", err.message);
    process.exit(1);
  }
}

await main();
