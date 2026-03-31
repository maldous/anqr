#!/usr/bin/env node

/**
 * create-openrouter-trinity-mini-key-issue.mjs — Create Linear issue for OpenRouter trinity-mini invalid API key
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueInput = {
  title: "Provider config: OpenRouter trinity-mini invalid API key format",
  description: `## Summary

Tool probe for openrouter-trinity-mini provider is consistently failing with "Invalid format of key" error from Arcee AI, indicating API key configuration issue.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- Harness: Symphony OpenAI bridge provider configuration
- Harness: OpenRouter API key management
- Harness: Provider health validation

## Constraints

- **Architecture**: OpenRouter routes to Arcee AI for trinity-mini model
- **Security**: API keys stored in environment variables
- **Cost**: Invalid key prevents using this free/low-cost provider

## Problem Statement

Journal logs show recurring API key format errors:

\`\`\`
Apr 01 01:43:51 anqr-symphony-bridge[167436]: [symphony-openai-bridge.mjs:3451] [WARN] 🔧 TOOL PROBE INFRA: openrouter-trinity-mini - AI_APICallError: [Arcee AI] Invalid format of key.
Apr 01 01:43:52 anqr-symphony-bridge[167436]: [symphony-openai-bridge.mjs:3451] [WARN] 🔧 TOOL PROBE INFRA: openrouter-trinity-mini - AI_APICallError: [Arcee AI] Invalid format of key.
\`\`\`

**Frequency:** Every tool probe cycle
**Pattern:** Consistent failure, not transient
**Error source:** Arcee AI (upstream provider via OpenRouter)
**Impact:** Provider permanently marked unhealthy, never used

## Root Cause Hypotheses

1. **Wrong API key type**: Using OpenRouter key where Arcee AI key expected
2. **Key format mismatch**: OpenRouter may require special prefix/format for Arcee AI models
3. **Deprecated endpoint**: trinity-mini may have been moved or deprecated
4. **OpenRouter routing issue**: OpenRouter not properly forwarding auth to Arcee AI
5. **Missing configuration**: Additional headers or parameters required

## Investigation Path

### 1. OpenRouter Documentation Review

- [ ] Check OpenRouter docs for trinity-mini model availability
- [ ] Review authentication requirements for Arcee AI models
- [ ] Verify model identifier is correct: \`arcee-ai/trinity-mini\` or similar
- [ ] Check if model requires separate Arcee AI API key

### 2. API Key Validation

- [ ] Verify OPENROUTER_API_KEY format in environment
- [ ] Test API key with OpenRouter curl command
- [ ] Check if other OpenRouter models work (to isolate issue)
- [ ] Review OpenRouter dashboard for API key restrictions

### 3. Model Availability Check

- [ ] Check OpenRouter model list: \`curl https://openrouter.ai/api/v1/models\`
- [ ] Verify trinity-mini is still available
- [ ] Check if model has been renamed or deprecated
- [ ] Review OpenRouter changelog for breaking changes

### 4. Provider Configuration Review

- [ ] Review symphony-openai-bridge.mjs provider config for trinity-mini
- [ ] Check if special headers or parameters required
- [ ] Verify base URL is correct for OpenRouter
- [ ] Compare with working OpenRouter provider configurations

### 5. Mitigation Options

**Option A: Fix API Key**
- Obtain correct Arcee AI key if needed
- Update key format/prefix

**Option B: Update Model Identifier**
- Use correct model name if changed
- Update provider configuration

**Option C: Remove Provider**
- If model deprecated, remove from provider list
- Document removal reason

**Option D: Add Bypass**
- Skip trinity-mini in provider health checks
- Mark as "optional" provider

## Impact

- **Severity**: P3 (Low) - Does not block core functionality
- **Scope**: Single provider (openrouter-trinity-mini)
- **User impact**: None - other providers available
- **Operational impact**: Log noise from recurring errors

## Diagnostic Commands

\`\`\`bash
# Count trinity-mini errors
journalctl --user -u anqr-symphony-bridge --since "7 days ago" --no-pager | grep "openrouter-trinity-mini" | grep "Invalid format of key" | wc -l

# Check OpenRouter API key format
echo $OPENROUTER_API_KEY | cut -c1-10
# Should start with "sk-or-v1-"

# Test OpenRouter API key validity
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# List available OpenRouter models
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq -r '.data[].id' | grep -i trinity

# Test trinity-mini directly via OpenRouter
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "arcee-ai/trinity-mini",
    "messages": [{"role": "user", "content": "test"}]
  }'
\`\`\`

## Definition Of Done

- [ ] Root cause identified (key format, model availability, or config)
- [ ] Error resolved or provider removed
- [ ] No more "Invalid format of key" errors for trinity-mini
- [ ] Documentation updated if configuration changed
- [ ] Evidence document with resolution approach

## Verification

\`\`\`bash
# After fix, verify error elimination
journalctl --user -u anqr-symphony-bridge --since "24 hours ago" --no-pager | grep "openrouter-trinity-mini" | grep "Invalid format of key" | wc -l
# Should be 0

# If provider removed, verify it's not in config
grep -r "trinity-mini" scripts/ops/integrations/model/
# Should return no provider configuration
\`\`\`

## Evidence Payload

- Summary: OpenRouter trinity-mini API key investigation and remediation
- Scope class: docs-harness
- Touched paths: Provider configuration, API key setup
- Decisions made: Fix key, update model, or remove provider
- Commands run: API key validation, model availability check
- Pass/fail result: 0 errors per day
- Risk: Low - isolated to single optional provider
- Follow-up work: Monitor other OpenRouter providers for similar issues

## Escalate If

- OpenRouter account has broader authentication issues
- Multiple OpenRouter models failing (not just trinity-mini)
- API key rotation required but credentials unavailable`,
  stateId: STATES.todo,
  labelIds: [LABELS.harness, LABELS.hygiene],
  priority: 3, // P3 - single provider, not critical
  estimate: 1,
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
