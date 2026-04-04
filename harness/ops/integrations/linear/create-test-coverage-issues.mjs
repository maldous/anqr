#!/usr/bin/env node

/**
 * create-test-coverage-issues.mjs — Create Linear issues for test coverage >80% initiative
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueGroups = [
  {
    title: "Phase 2: Domain Core Unit Tests (Target: +35% coverage)",
    description: `## Summary

Implement comprehensive unit tests for domain packages (QR, render, payload, analyze, logging)

## Scope Class

\`core-packages\`

## Owned Surfaces

- \`packages/domain/qr/src/**/*.ts\`
- \`packages/domain/render/src/**/*.ts\`
- \`packages/domain/payload/src/**/*.ts\`
- \`packages/domain/analyze/src/**/*.ts\`
- \`packages/domain/logging/src/**/*.ts\`

## Current Coverage

9% (1507/16302 lines)

## Target Coverage

85%+ (adds ~12,000 lines, +58% to total)

## Constraints

- Pure unit tests only (no network, filesystem mutation, SDK calls)
- Colocated \`*.spec.ts\` files in package roots
- Use property-based tests for large output spaces (payload generation, QR encoding)
- Golden fixtures for render and analysis invariants

## Sub-tasks

### 1.1 Domain QR Core (\`packages/domain/qr/src\`)
- QR encoding logic (versions 1-40, ECC levels L/M/Q/H)
- Mask selection and penalty scoring
- Version auto-selection
- Capacity calculation
- Structured append support
- **Files**: ~50 files, ~5000 lines uncovered

### 1.2 Domain Render (\`packages/domain/render/src\`)
- Canvas rendering primitives
- Module style rendering (square, circle, rounded)
- Color and gradient application
- Blend mode implementations
- Filter effects (blur, sharpen, edge detection)
- Animation frame generation
- **Files**: ~60 files, ~4000 lines uncovered

### 1.3 Domain Payload (\`packages/domain/payload/src\`)
- Payload generators (vCard, Wi-Fi, email, SMS, URL, etc.)
- Payment payload generation (UPI, PIX, PayPal, etc.)
- Social profile links
- Event/calendar encoding
- **Files**: ~30 files (already has some tests), ~1500 lines uncovered

### 1.4 Domain Analyze (\`packages/domain/analyze/src\`)
- QR analysis and metrics
- Decoder validation
- Matrix diagnostics
- Reproduction logic
- **Files**: ~25 files, ~1500 lines uncovered

### 1.5 Domain Logging (\`packages/domain/logging/src\`)
- Already has tests but needs completion
- Buffer capture, redaction, structured logging
- **Files**: ~10 files, ~500 lines uncovered

## Definition Of Done

- [ ] All domain packages at 85%+ line coverage
- [ ] Property-based tests for QR encoding and payload generation
- [ ] Golden fixtures committed for render outputs
- [ ] All tests pass in isolation and in CI

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:unit -- --coverage
# Check coverage/coverage-summary.json for domain packages
\`\`\`

## Evidence Payload

- Coverage report showing domain packages at 85%+
- List of new test files created
- Any fixtures or test utilities added
- Commands run with pass/fail results
- Commit hash`,
    priority: 1, // High priority - largest impact
    estimate: 8,
  },
  {
    title: "Phase 3: Application Services Tests (Target: +10% coverage)",
    description: `## Summary

Implement unit and integration tests for application orchestration layer with fakes

## Scope Class

\`core-packages\`

## Owned Surfaces

- \`packages/application/analyze/src/**/*.ts\`
- \`packages/application/generator/src/**/*.ts\`
- \`packages/application/gallery/src/**/*.ts\`
- \`packages/application/onboarding/src/**/*.ts\`
- \`packages/application/monetization/src/**/*.ts\`

## Current Coverage

10% (268/2582 lines)

## Target Coverage

85%+ (adds ~1950 lines, +9% to total)

## Constraints

- Use fakes from \`packages/testing/fakes\` for dependencies
- Integration tests across ports
- Unhappy-path tests for retries, fallback, validation

## Sub-tasks

### 2.1 Application Analyze (\`packages/application/analyze/src\`)
- Analysis orchestration
- Camera image loading
- Export/import analysis JSON
- Reproduction workflows
- **Files**: ~50 files, ~2000 lines uncovered

### 2.2 Application Generator (\`packages/application/generator/src\`)
- Generator orchestration
- Worker lifecycle
- Server-side generation
- **Files**: ~15 files, ~400 lines uncovered

### 2.3 Application Gallery/Onboarding/Monetization
- Gallery permutation builder
- Onboarding flows
- Monetization hooks
- **Files**: ~10 files, ~200 lines uncovered

## Definition Of Done

- [ ] All application packages at 85%+ line coverage
- [ ] Fakes used for external dependencies
- [ ] Unhappy paths covered (validation failures, retries)
- [ ] All tests pass in isolation and in CI

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:unit -- --coverage
# Check application package coverage
\`\`\`

## Evidence Payload

- Coverage report showing application packages at 85%+
- List of new test files and fakes used
- Commands run with pass/fail results
- Commit hash`,
    priority: 1,
    estimate: 5,
  },
  {
    title: "Phase 4: Platform & Netlify Adapters (Target: +5% coverage)",
    description: `## Summary

Implement integration tests for platform adapters and Netlify functions

## Scope Class

\`api-mcp\`

## Owned Surfaces

- \`netlify/functions/**/*.ts\`
- \`netlify/edge-functions/**/*.ts\`
- \`packages/platform/node/src/**/*.ts\`
- \`packages/platform/browser/src/**/*.ts\`
- \`packages/platform/worker/src/**/*.ts\`
- \`packages/platform/native/src/**/*.ts\`

## Current Coverage

- Platform: 11% (116/1034 lines)
- Netlify: Not in package coverage (separate concern)

## Target Coverage

80%+ (adds ~900 platform lines, ~4% to total)

## Constraints

- Integration tests against adapter ports
- Contract tests for request/response mapping
- File/process/network boundary tests with controlled doubles

## Sub-tasks

### 3.1 Netlify QR Function (\`netlify/functions/qr/\`)
- Handler logic
- Parameter parsing (animation, overlay, styling, output)
- Cache key computation
- Validation logic
- **Files**: ~80 files, estimate ~3000 lines (separate from package coverage)

### 3.2 Platform Node/Browser/Worker (\`packages/platform/*/src\`)
- Platform detection
- Canvas factory implementations
- Runtime-specific helpers
- **Files**: ~15 files, ~900 lines uncovered

## Definition Of Done

- [ ] Platform packages at 80%+ line coverage
- [ ] Netlify function handlers have dedicated integration tests
- [ ] Contract tests validate request/response shapes
- [ ] Tests pass in CI

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:unit -- --coverage
# Platform packages coverage check
npm run test:integration
# Netlify function integration tests
\`\`\`

## Evidence Payload

- Coverage report showing platform packages at 80%+
- Netlify function test results
- Commands run with pass/fail results
- Commit hash`,
    priority: 2,
    estimate: 5,
  },
  {
    title: "Phase 5: Harness Model Routing Tests (Target: maintain harness quality)",
    description: `## Summary

Expand harness model routing tests to cover edge cases and policy enforcement

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/integrations/model/**/*.mjs\`

## Current Coverage

Already covered by \`tests/integration/\` and \`tests/e2e/openclaw-symphony.spec.ts\` (90 tests)

## Target

Add 20-30 more tests for edge cases

## Sub-tasks

### 4.1 Provider Routing Edge Cases
- Tier boundary conditions
- Safety net score ceiling validation
- Cooldown and retry logic
- Provider degradation scenarios

### 4.2 Credit Gate Policy Tests
- Paid/free mode switching
- Key rotation timing
- Quota exhaustion

### 4.3 Adaptive Context Tests
- Context window shrinking/expansion
- Rate limit parsing
- TPM/RPM tracking

## Definition Of Done

- [ ] 20+ new harness tests added
- [ ] All edge cases documented
- [ ] Tests pass in CI

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:integration
npm run test:e2e
\`\`\`

## Evidence Payload

- List of new test cases added
- Test results showing all passing
- Commands run with pass/fail results
- Commit hash`,
    priority: 2,
    estimate: 3,
  },
  {
    title: "Testing Infrastructure & Utilities (Target: +2% coverage)",
    description: `## Summary

Implement tests for testing infrastructure itself

## Scope Class

\`core-packages\`

## Owned Surfaces

- \`packages/testing/contracts/src/**/*.ts\`
- \`packages/testing/fakes/src/**/*.ts\`
- \`packages/testing/fixtures/src/**/*.ts\`

## Current Coverage

0% (0/112 lines)

## Target Coverage

80%+ (adds ~90 lines, <1% to total)

## Sub-tasks

### 5.1 Testing Contracts
- Harness bridge contract validation
- Schema validation helpers
- Dynamic test ID allocation

### 5.2 Testing Fakes
- Fake implementations validation
- Harness fake adapters

### 5.3 Testing Fixtures
- Scenario loading and validation

## Definition Of Done

- [ ] Testing packages at 80%+ coverage
- [ ] Self-hosted tests validate test utilities
- [ ] CI passes

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:unit -- --coverage
\`\`\`

## Evidence Payload

- Coverage report showing testing packages at 80%+
- Commands run with pass/fail results
- Commit hash`,
    priority: 3,
    estimate: 2,
  },
  {
    title: "UI & Analytics Coverage (Target: +3% coverage)",
    description: `## Summary

Selective UI component and analytics tests for critical paths

## Scope Class

\`product-web\`

## Owned Surfaces

- \`packages/ui/web/src/**/*.{ts,tsx}\` (critical paths only)
- \`packages/analytics/ads/src/**/*.{ts,tsx}\`
- \`packages/analytics/ga4/src/**/*.{ts,tsx}\`

## Current Coverage

- UI: 17% (58/328 lines)
- Analytics: 12% (6/48 lines)

## Target Coverage

60%+ for critical UI paths (adds ~200 lines, ~1% to total)

## Constraints

- Focus on stateful UI seams, not presentation components
- Component tests with vitest + jsdom
- Analytics validation with fakes

## Sub-tasks

### 6.1 UI Web Dynamic TestID
- Already partially covered, complete remaining utilities
- **Files**: ~5 files, ~100 lines uncovered

### 6.2 UI Primitives (Critical Only)
- Button, input, select (interaction logic only)
- **Files**: ~10 files, ~150 lines uncovered

### 6.3 Analytics
- GA4 event tracking
- Ads placeholder logic
- **Files**: ~5 files, ~40 lines uncovered

## Definition Of Done

- [ ] Critical UI paths at 60%+ coverage
- [ ] Analytics at 60%+ coverage
- [ ] Component tests use jsdom
- [ ] CI passes

## Verification

\`\`\`bash
npm run typecheck:all
npm run test:unit -- --coverage
\`\`\`

## Evidence Payload

- Coverage report showing UI and analytics packages at 60%+
- Commands run with pass/fail results
- Commit hash`,
    priority: 3,
    estimate: 3,
  },
];

async function main() {
  console.log("Creating test coverage Linear issues...\n");

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
  console.log(`\n📈 Coverage Impact Projection:`);
  console.log(`   Current: 10.3% (2132/20688 lines)`);
  console.log(`   Target: 83.5% (17482/20688 lines)`);
  console.log(`   Total effort: 26 story points across 6 issue groups`);
}

await main();
