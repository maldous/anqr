#!/usr/bin/env node

/**
 * create-ast-audit-issues.mjs — Create Linear issues for ANQ-1131: One AST per file refactor
 *
 * Breaks down the entire scripts/** surface into sensible-sized chunks that can each
 * be handled by an agent in a single pass.
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueGroups = [
  {
    title: "AST Audit Phase 1: Core Infrastructure & State Management",
    description: `## Summary

Refactor core infrastructure modules in scripts/ops/core and scripts/ops/lib to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/core/symphony-config.mjs\` (config loading, validation)
- \`scripts/ops/core/symphony-state.mjs\` (state persistence)
- \`scripts/ops/core/symphony-validation.mjs\` (validation helpers)
- \`scripts/ops/core/worktree-config.mjs\` (worktree configuration)
- \`scripts/ops/lib/logger.mjs\` (logging infrastructure)
- \`scripts/ops/lib/notify.mjs\` (notification helpers)

**Total:** ~6 files, estimated 15-20 exported functions to split

## Constraints

- Each file must export exactly one class, function, or const
- Preserve all existing behavior and interfaces
- Update all imports across the codebase
- Maintain backward compatibility during transition
- All harness quality gates must pass

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] All imports updated across scripts/**, tests/**, and services/
- [ ] No broken references
- [ ] \`npm run typecheck:harness\` passes
- [ ] \`npm run test:integration\` passes
- [ ] Evidence document created

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
find scripts/ops/core scripts/ops/lib -name "*.mjs" -exec node -c {} \\;
\`\`\`

## Evidence Payload

- List of files split (before → after)
- Import update count by directory
- Commands run with pass/fail results
- Commit hash
- Any breaking changes or migration notes

## Escalate If

- Circular dependencies discovered that can't be resolved
- Test failures unrelated to the refactor
- Provider routing breaks during validation`,
    priority: 1, // High priority - foundation for other phases
    estimate: 5,
  },
  {
    title: "AST Audit Phase 2: Model Integration & Bridge Routing",
    description: `## Summary

Refactor model integration modules in scripts/ops/integrations/model to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/integrations/model/symphony-openai-bridge.mjs\` (main bridge, tools, routing)
- \`scripts/ops/integrations/model/symphony-adaptive-context.mjs\` (context management)
- \`scripts/ops/integrations/model/symphony-credit-gate.mjs\` (credit/quota management)
- \`scripts/ops/integrations/model/symphony-session-state.mjs\` (session persistence)
- \`scripts/ops/integrations/model/symphony-provider-health.mjs\` (health checks)
- \`scripts/ops/integrations/model/codebuff-openai-bridge.mjs\` (Codebuff compatibility)
- \`scripts/ops/integrations/model/discord-request-router.mjs\` (Discord routing)

**Total:** ~7 files, estimated 30-40 exported functions (bridge has many tools)

## Constraints

- Bridge tool registry must remain functional
- Provider routing logic must stay atomic
- Credit gate policy enforcement unchanged
- All existing tool schemas preserved
- Discord command routing must not break

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Tool registry still functional
- [ ] Provider routing tests pass
- [ ] Discord integration tests pass
- [ ] \`npm run typecheck:harness\` passes
- [ ] \`npm run test:integration\` passes
- [ ] \`npm run test:e2e\` passes

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
npm run test:e2e
# Verify bridge startup
node scripts/ops/integrations/model/symphony-openai-bridge.mjs &
sleep 5
curl http://127.0.0.1:3124/v1/models
killall node
\`\`\`

## Evidence Payload

- List of files split
- Tool registry validation results
- Provider routing test results
- Discord integration test results
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Bridge fails to start
- Tool definitions become invalid
- Provider routing degrades
- Discord commands fail`,
    priority: 1, // High priority - critical bridge infrastructure
    estimate: 8,
  },
  {
    title: "AST Audit Phase 3: Linear Integration & Issue Management",
    description: `## Summary

Refactor Linear integration modules in scripts/ops/integrations/linear to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/integrations/linear/linear-client.mjs\` (API client, states, labels)
- \`scripts/ops/integrations/linear/incident-manager.mjs\` (incident creation, fingerprinting)
- \`scripts/ops/integrations/linear/incident-resolution.mjs\` (resolution workflows)
- \`scripts/ops/integrations/linear/incident-evidence.mjs\` (evidence formatting)
- \`scripts/ops/integrations/linear/incident-fingerprint.mjs\` (deduplication)
- \`scripts/ops/integrations/linear/issue-hygiene.mjs\` (cleanup automation)
- \`scripts/ops/integrations/linear/export-issues.mjs\` (issue export)
- \`scripts/ops/integrations/linear/github-linear-sync-audit.mjs\` (sync validation)

**Total:** ~8 files, estimated 25-30 exported functions

## Constraints

- Linear API client interface unchanged
- Incident fingerprinting logic preserved
- Issue export format unchanged (needed for Linear RAG)
- All existing incident types supported

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Linear client still functional
- [ ] Incident creation works
- [ ] Issue export format unchanged
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
# Verify Linear export still works
node scripts/ops/integrations/linear/export-issues.mjs
test -f reports/linear-export/issues-latest.json
\`\`\`

## Evidence Payload

- List of files split
- Linear client validation results
- Issue export format validation
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Linear API authentication breaks
- Issue export format changes
- Incident fingerprinting logic fails`,
    priority: 1,
    estimate: 6,
  },
  {
    title: "AST Audit Phase 4: RAG & Search Infrastructure",
    description: `## Summary

Refactor RAG and search modules in scripts/ops/lib/rag and scripts/ops/lib/search to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/lib/rag/build-index.mjs\` (repo RAG index builder)
- \`scripts/ops/lib/rag/build-index-linear.mjs\` (Linear RAG index builder)
- \`scripts/ops/lib/rag/embeddings.mjs\` (Ollama embeddings)
- \`scripts/ops/lib/rag/vector-store.mjs\` (vector store operations)
- \`scripts/ops/lib/rag/chunker.mjs\` (text chunking)
- \`scripts/ops/lib/rag/linear-chunker.mjs\` (Linear issue chunking)
- \`scripts/ops/lib/search/hybrid-search.mjs\` (BM25 + vector search)
- \`scripts/ops/lib/search/linear-search.mjs\` (Linear issue search)

**Total:** ~8 files, estimated 20-25 exported functions

## Constraints

- RAG index format unchanged (compatibility with bridge tools)
- Embedding generation interface preserved
- Search result ranking unchanged
- Linear RAG index format compatible with search_linear_issues tool

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] RAG index builds successfully
- [ ] Linear RAG index builds successfully
- [ ] Search results match previous behavior
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
# Verify RAG index builds
node scripts/ops/lib/rag/build-index.mjs
node scripts/ops/lib/rag/build-index-linear.mjs
test -f reports/rag-index/meta.json
test -f reports/rag-index-linear/meta.json
\`\`\`

## Evidence Payload

- List of files split
- RAG index build validation
- Search result comparison (before/after)
- Commands run with pass/fail results
- Commit hash

## Escalate If

- RAG index format changes
- Search quality degrades
- Ollama embeddings fail`,
    priority: 1,
    estimate: 6,
  },
  {
    title: "AST Audit Phase 5: Orchestration & Queue Management",
    description: `## Summary

Refactor orchestration modules in scripts/ops/orchestration to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/orchestration/symphony-runner.mjs\` (main execution loop)
- \`scripts/ops/orchestration/symphony-queue-control.mjs\` (queue operations)
- \`scripts/ops/orchestration/symphony-control.mjs\` (control commands)
- \`scripts/ops/orchestration/symphony-worktree-pool.mjs\` (worktree management)
- \`scripts/ops/orchestration/nightly-ops-pass.mjs\` (nightly automation)
- \`scripts/ops/orchestration/reset-queue.mjs\` (queue reset)
- \`scripts/ops/orchestration/latency-report.mjs\` (performance reporting)
- \`scripts/ops/orchestration/analyze-worktree-benchmark.mjs\` (benchmark analysis)

**Total:** ~8 files, estimated 25-30 exported functions

## Constraints

- Runner execution loop unchanged
- Queue state transitions preserved
- Worktree lifecycle management intact
- Nightly ops automation unchanged
- PID locking logic preserved

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Symphony runner still executes issues
- [ ] Queue operations functional
- [ ] Worktree pool management works
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass
- [ ] E2E tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
npm run test:e2e
# Verify queue control
node scripts/ops/orchestration/symphony-queue-control.mjs --status
\`\`\`

## Evidence Payload

- List of files split
- Runner validation results
- Queue control test results
- Worktree pool test results
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Runner fails to execute issues
- Queue state corruption
- Worktree deadlock or resource leaks`,
    priority: 1,
    estimate: 7,
  },
  {
    title: "AST Audit Phase 6: Runtime Services & Monitoring",
    description: `## Summary

Refactor runtime service modules in scripts/ops/runtime to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/runtime/symphony/symphony-agent.mjs\` (agent wrapper)
- \`scripts/ops/runtime/symphony/bridge-result.mjs\` (result processing)
- \`scripts/ops/runtime/symphony/stuck-detection.mjs\` (stuck issue detection)
- \`scripts/ops/runtime/watchdog/bridge-watchdog.mjs\` (bridge monitoring)
- \`scripts/ops/runtime/mcp/context7-http-service.mjs\` (Context7 HTTP)
- \`scripts/ops/runtime/mcp/context7-server.mjs\` (Context7 MCP)
- \`scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs\` (Discord gateway)

**Total:** ~7 files, estimated 20-25 exported functions

## Constraints

- Agent wrapper interface unchanged
- Stuck detection thresholds preserved
- Bridge watchdog monitoring intact
- Context7 HTTP/MCP compatibility maintained
- Discord gateway singleton lock logic preserved

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Symphony agent wrapper functional
- [ ] Stuck detection works
- [ ] Bridge watchdog monitors correctly
- [ ] Context7 services start
- [ ] Discord gateway singleton acquires lock
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
# Verify Context7 HTTP service
node scripts/ops/runtime/mcp/context7-http-service.mjs &
sleep 3
curl http://127.0.0.1:4320/health
killall node
\`\`\`

## Evidence Payload

- List of files split
- Service startup validation
- Monitoring validation results
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Services fail to start
- Watchdog monitoring breaks
- Discord gateway lock fails`,
    priority: 2,
    estimate: 5,
  },
  {
    title: "AST Audit Phase 7: Notifications & Reporting",
    description: `## Summary

Refactor notification and reporting modules in scripts/ops/notifications and scripts/ops/reporting to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/integrations/notifications/discord-webhook.mjs\` (Discord webhook client)
- \`scripts/ops/integrations/notifications/test-discord.mjs\` (Discord test harness)
- \`scripts/ops/notifications/notify-impl.mjs\` (notification implementation)
- \`scripts/ops/notifications/notify.mjs\` (notification interface)
- \`scripts/ops/reporting/harness-report.mjs\` (harness status reporting)
- \`scripts/ops/lib/service-restart-notify.mjs\` (restart notifications)

**Total:** ~6 files, estimated 15-20 exported functions

## Constraints

- Discord webhook format unchanged
- Notification interface preserved
- Report format unchanged
- Service restart notification logic intact

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Discord webhooks send successfully
- [ ] Notifications deliver
- [ ] Reports generate correctly
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
# Verify harness report generation
node scripts/ops/reporting/harness-report.mjs > /tmp/harness-report.txt
test -s /tmp/harness-report.txt
\`\`\`

## Evidence Payload

- List of files split
- Discord webhook test results
- Report generation validation
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Discord webhook authentication breaks
- Report format becomes invalid`,
    priority: 2,
    estimate: 4,
  },
  {
    title: "AST Audit Phase 8: Governance, Email, Sonar Integration",
    description: `## Summary

Refactor governance, email ingest, and Sonar integration modules to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/governance/linear-guardian.mjs\` (workspace governance)
- \`scripts/ops/integrations/email/email-ingest.mjs\` (email → Linear issues)
- \`scripts/ops/integrations/sonar/sonar-linear-sync.mjs\` (Sonar → Linear sync)
- \`scripts/ops/integrations/sonar/sonar-linear-audit.mjs\` (sync auditing)
- \`scripts/ops/lib/sonar-linear-sync.mjs\` (sync implementation)

**Total:** ~5 files, estimated 15-20 exported functions

## Constraints

- Linear workspace governance rules unchanged
- Email parsing and issue creation preserved
- Sonar finding sync logic intact
- Audit trail format unchanged

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] Linear guardian enforces governance
- [ ] Email ingest creates issues
- [ ] Sonar sync works
- [ ] \`npm run typecheck:harness\` passes
- [ ] Integration tests pass

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
# Verify Linear guardian
node scripts/ops/governance/linear-guardian.mjs --dry-run
\`\`\`

## Evidence Payload

- List of files split
- Governance validation results
- Email ingest test results
- Sonar sync validation
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Workspace governance becomes too strict or too lax
- Email parsing breaks
- Sonar API authentication fails`,
    priority: 2,
    estimate: 4,
  },
  {
    title: "AST Audit Phase 9: Root Scripts & Utilities",
    description: `## Summary

Refactor root-level scripts and utilities to export one AST per file.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/generate-openapi.ts\` (OpenAPI generation)
- \`scripts/contracts-check.mjs\` (contract validation)
- \`scripts/audit-ast-density.mjs\` (AST audit tooling)
- \`scripts/list-ast-names.mjs\` (AST inspection)
- \`scripts/lib/ast-helpers.mjs\` (AST helper utilities)
- \`scripts/rename-to-standards.mjs\` (codebase refactoring)

**Total:** ~6 files, estimated 15-20 exported functions

## Constraints

- OpenAPI generation unchanged
- Contract validation logic preserved
- AST audit tooling still functional

## Definition Of Done

- [ ] Each file exports exactly one AST node
- [ ] OpenAPI generation works
- [ ] Contract checks pass
- [ ] AST audit tools functional
- [ ] \`npm run typecheck:harness\` passes
- [ ] \`npm run typecheck:all\` passes

## Verification

\`\`\`bash
npm run typecheck:harness
npm run typecheck:all
# Verify OpenAPI generation
node --loader ts-node/esm scripts/generate-openapi.ts
test -f public/openapi.yaml
# Verify AST audit
node scripts/audit-ast-density.mjs
\`\`\`

## Evidence Payload

- List of files split
- OpenAPI generation validation
- Contract check results
- AST audit tool validation
- Commands run with pass/fail results
- Commit hash

## Escalate If

- OpenAPI schema becomes invalid
- Contract validation breaks`,
    priority: 3,
    estimate: 3,
  },
  {
    title: "AST Audit Phase 10: Legacy Root Scripts & Cleanup",
    description: `## Summary

Refactor or deprecate legacy root-level scripts and complete AST audit cleanup.

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/email-ingest.mjs\` (root-level shim, deprecate?)
- \`scripts/ops/harness-report.mjs\` (root-level shim, deprecate?)
- \`scripts/ops/linear-client.mjs\` (root-level shim, deprecate?)
- \`scripts/ops/linear-guardian.mjs\` (root-level shim, deprecate?)
- \`scripts/ops/symphony-*.mjs\` (root-level shims, deprecate?)
- Any remaining scripts/ops/*.mjs files

**Total:** ~10-15 files, mostly shims to remove or update

## Constraints

- Systemd service files may reference old paths
- Update service files if paths change
- Preserve backward compatibility via symlinks if needed
- Document all deprecations

## Definition Of Done

- [ ] All root-level shims either refactored or marked deprecated
- [ ] Systemd service files updated if needed
- [ ] Documentation updated for new paths
- [ ] All harness tests pass
- [ ] \`npm run typecheck:harness\` passes
- [ ] \`npm run test:integration\` passes
- [ ] \`npm run test:e2e\` passes

## Verification

\`\`\`bash
npm run typecheck:harness
npm run test:integration
npm run test:e2e
# Verify no broken symlinks
find scripts/ops -type l -exec test ! -e {} \\; -print
\`\`\`

## Evidence Payload

- List of deprecated files
- List of updated service files
- Documentation updates
- Commands run with pass/fail results
- Commit hash

## Escalate If

- Systemd services fail after path updates
- Tests reveal hidden dependencies on old paths`,
    priority: 3,
    estimate: 3,
  },
];

async function main() {
  console.log("Creating AST Audit Linear issues for ANQ-1131...\n");

  const created = [];
  for (const group of issueGroups) {
    try {
      const issue = await createIssue({
        title: group.title,
        description: group.description,
        stateId: STATES.backlog,
        labelIds: [LABELS.harness],
        priority: group.priority,
        estimate: group.estimate,
      });

      created.push(issue);
      console.log(`✅ Created: ${issue.identifier} — ${issue.title}`);
      console.log(`   URL: https://linear.app/anqr/issue/${issue.identifier}`);
      console.log(`   Priority: P${issue.priority} | Estimate: ${issue.estimate} points\n`);
    } catch (err) {
      console.error(`❌ Failed to create issue: ${group.title}`);
      console.error(`   Error: ${err.message}\n`);
    }
  }

  console.log(`\n📊 Summary: Created ${created.length}/${issueGroups.length} issues`);
  console.log(`\n📈 Refactor Scope:`);
  console.log(`   Total files: ~156 .mjs/.ts files in scripts/**`);
  console.log(`   Estimated functions to split: ~200-250 top-level exports`);
  console.log(
    `   Total effort: ${issueGroups.reduce((sum, g) => sum + g.estimate, 0)} story points across ${issueGroups.length} phases`,
  );
  console.log(`\n🎯 Execution Strategy:`);
  console.log(`   - Phases 1-5: Critical path (foundation, bridge, Linear, RAG, orchestration)`);
  console.log(`   - Phases 6-8: Secondary services (runtime, notifications, governance)`);
  console.log(`   - Phases 9-10: Utilities and cleanup`);
  console.log(`\n   Each phase can be executed independently by a single agent pass.`);
}

await main();
