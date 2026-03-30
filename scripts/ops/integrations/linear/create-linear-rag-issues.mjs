#!/usr/bin/env node

/**
 * create-linear-rag-issues.mjs — Create Linear issues for ANQ-1120 Linear RAG integration
 * 
 * References ANQ-1120: Linear Issue RAG Integration Investigation
 * Status: PROCEED with phased implementation
 */

import { createIssue, STATES, LABELS } from "./linear-client.mjs";

const issueGroups = [
  {
    title: "Linear Issue Export Script (ANQ-1120 Phase 1.1)",
    description: `## Summary

Implement nightly Linear issue export to JSON for RAG indexing.

**Parent:** ANQ-1120 (Linear Issue RAG Integration Investigation)

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/integrations/linear/export-issues.mjs\` (NEW)
- \`reports/linear-export/\` (NEW directory)

## Current State

No automated Linear issue export exists. Agents cannot search historical Linear context.

## Target State

Nightly export of Linear issues to \`reports/linear-export/issues-latest.json\` for downstream RAG indexing.

## Implementation Details

### Export Script (\`export-issues.mjs\`)

\`\`\`javascript
// Fetch issues via linear-client.mjs
const todoIssues = await listIssuesByState(['Todo', 'In Progress', 'In Review']);
const recentDone = await listRecentDoneIssues(90); // Last 90 days

// Filter out Canceled
const allIssues = [...todoIssues, ...recentDone]
  .filter(issue => issue.state.name !== 'Canceled');

// Write to JSON
const exportPath = 'reports/linear-export/issues-latest.json';
await writeFile(exportPath, JSON.stringify(allIssues, null, 2));
\`\`\`

### Export Format

\`\`\`json
[
  {
    "id": "...",
    "identifier": "ANQ-1120",
    "title": "Linear Issue RAG Integration Investigation",
    "description": "...",
    "state": { "name": "Done" },
    "labels": { "nodes": [{ "id": "...", "name": "harness" }] },
    "priority": 1,
    "createdAt": "2025-03-27T...",
    "updatedAt": "2025-03-27T..."
  }
]
\`\`\`

## Constraints

- Use existing \`linear-client.mjs\` API helpers
- Export only metadata (no comments in Phase 1)
- Filter: Open issues + Done issues updated within 90 days
- Exclude: Canceled state
- Output: \`reports/linear-export/issues-latest.json\`
- Add \`reports/linear-export/*.json\` to \`.gitignore\` (too large)

## Definition Of Done

- [ ] \`export-issues.mjs\` script created
- [ ] Script successfully fetches and filters Linear issues
- [ ] JSON export written to \`reports/linear-export/issues-latest.json\`
- [ ] \`.gitignore\` updated to exclude exports
- [ ] Manual test run shows valid JSON output
- [ ] Script handles API errors gracefully (retry, timeout)

## Verification

\`\`\`bash
# Run export manually
node scripts/ops/integrations/linear/export-issues.mjs

# Verify output
cat reports/linear-export/issues-latest.json | jq '.[] | {identifier, title, state}'

# Check issue count and filtering
jq 'length' reports/linear-export/issues-latest.json
jq '[.[] | select(.state.name == "Canceled")] | length' reports/linear-export/issues-latest.json
# Should be 0 (Canceled issues excluded)
\`\`\`

## Evidence Payload

- Export script source code
- Sample JSON output (first 3 issues)
- Issue count and state distribution
- Commands run with results
- Commit hash

## Dependencies

- Blocks ANQ-1122 (Linear RAG builder needs export output)

## Estimated Effort

1 point (~30 minutes)`,
    priority: 1,
    estimate: 1,
  },
  {
    title: "Linear RAG Index Builder (ANQ-1120 Phase 1.2)",
    description: `## Summary

Implement Linear-specific RAG index builder to generate embeddings from exported issues.

**Parent:** ANQ-1120 (Linear Issue RAG Integration Investigation)

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/lib/rag/build-index-linear.mjs\` (NEW)
- \`scripts/ops/lib/rag/linear-chunker.mjs\` (NEW)
- \`reports/rag-index-linear/\` (NEW directory)

## Current State

No Linear-specific RAG index. Agents cannot semantically search Linear issues.

## Target State

Separate Linear RAG index at \`reports/rag-index-linear/\` with embeddings for all exported issues.

## Implementation Details

### Chunking Strategy (1 chunk per issue)

\`\`\`javascript
// scripts/ops/lib/rag/linear-chunker.mjs
export function chunkLinearIssue(issue) {
  const labels = issue.labels.nodes.map(l => l.name).join(", ");
  const content = \`
# \${issue.identifier}: \${issue.title}

**Priority:** \${issue.priority || "None"}
**State:** \${issue.state.name}
**Labels:** \${labels || "None"}

## Description

\${issue.description || "(no description)"}
\`.trim();

  return [{
    id: \`linear-\${issue.identifier}\`,
    filePath: \`linear://\${issue.identifier}\`,
    content,
    startLine: 1,
    endLine: 1,
    type: "issue",
    metadata: {
      identifier: issue.identifier,
      state: issue.state.name,
      priority: issue.priority,
      updatedAt: issue.updatedAt,
    },
  }];
}
\`\`\`

### Index Builder

\`\`\`javascript
// scripts/ops/lib/rag/build-index-linear.mjs
import { readFile } from 'node:fs/promises';
import { chunkLinearIssue } from './linear-chunker.mjs';
import { generateEmbeddings } from './embeddings.mjs';
import { saveIndex } from './vector-store.mjs';

const EXPORT_PATH = 'reports/linear-export/issues-latest.json';
const INDEX_DIR = 'reports/rag-index-linear';

async function buildLinearIndex() {
  const issues = JSON.parse(await readFile(EXPORT_PATH, 'utf8'));
  
  const chunks = issues.flatMap(chunkLinearIssue);
  const embeddings = await generateEmbeddings(chunks);
  
  await saveIndex(INDEX_DIR, { chunks, embeddings });
  
  console.log(\`✅ Indexed \${chunks.length} Linear issues\`);
}

await buildLinearIndex();
\`\`\`

## Constraints

- Reuse existing \`embeddings.mjs\` and \`vector-store.mjs\` infrastructure
- Separate index directory (\`reports/rag-index-linear/\`) for isolation
- One chunk per issue (no comment chunking in Phase 1)
- Use local Ollama for embeddings (no API costs)

## Definition Of Done

- [ ] \`linear-chunker.mjs\` created with chunking logic
- [ ] \`build-index-linear.mjs\` created
- [ ] Script successfully reads export JSON
- [ ] Embeddings generated via Ollama
- [ ] Index saved to \`reports/rag-index-linear/\`
- [ ] Manual test shows index metadata (chunk count, size)

## Verification

\`\`\`bash
# Run Linear RAG build
node scripts/ops/lib/rag/build-index-linear.mjs

# Check index stats
cat reports/rag-index-linear/meta.json | jq

# Expected output:
# {
#   "chunkCount": 200-500,
#   "lastBuild": "2025-03-27T...",
#   "indexSize": "~50-150 KB"
# }
\`\`\`

## Evidence Payload

- Chunker and builder source code
- Index metadata (chunk count, size)
- Sample chunk content (first issue)
- Build time and performance metrics
- Commands run with results
- Commit hash

## Dependencies

- Depends on ANQ-1121 (needs export output)
- Blocks ANQ-1123 (systemd automation needs working builder)

## Estimated Effort

2 points (~1 hour)`,
    priority: 1,
    estimate: 2,
  },
  {
    title: "Linear Export & Index Systemd Services (ANQ-1120 Phase 1.3)",
    description: `## Summary

Create systemd services and timers for automated nightly Linear export and RAG indexing.

**Parent:** ANQ-1120 (Linear Issue RAG Integration Investigation)

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`services/systemd/anqr-linear-export.service\` (NEW)
- \`services/systemd/anqr-linear-export.timer\` (NEW)
- \`services/systemd/anqr-rag-rebuild-linear.service\` (NEW)
- \`services/systemd/anqr-rag-rebuild-linear.timer\` (NEW)

## Current State

No automated Linear export or RAG rebuild. Manual execution only.

## Target State

Nightly automated pipeline:
- 02:30 — Export Linear issues
- 02:45 — Build Linear RAG index

## Implementation Details

### Export Service

\`\`\`ini
# services/systemd/anqr-linear-export.service
[Unit]
Description=ANQR Linear Issue Export
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/home/user/src/anqr
EnvironmentFile=/home/user/src/anqr/services/systemd/anqr-ops.env
ExecStart=/usr/bin/node scripts/ops/integrations/linear/export-issues.mjs
StandardOutput=journal
StandardError=journal
\`\`\`

### Export Timer

\`\`\`ini
# services/systemd/anqr-linear-export.timer
[Unit]
Description=ANQR Linear Issue Export Timer

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

### RAG Rebuild Service

\`\`\`ini
# services/systemd/anqr-rag-rebuild-linear.service
[Unit]
Description=ANQR Linear RAG Index Rebuild
After=anqr-linear-export.service

[Service]
Type=oneshot
WorkingDirectory=/home/user/src/anqr
EnvironmentFile=/home/user/src/anqr/services/systemd/anqr-ops.env
ExecStart=/usr/bin/node scripts/ops/lib/rag/build-index-linear.mjs
StandardOutput=journal
StandardError=journal
\`\`\`

### RAG Rebuild Timer

\`\`\`ini
# services/systemd/anqr-rag-rebuild-linear.timer
[Unit]
Description=ANQR Linear RAG Index Rebuild Timer

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:45:00
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

## Constraints

- Run export before index rebuild (15-minute gap)
- Use existing \`anqr-ops.env\` for LINEAR_API_KEY
- Log to systemd journal for monitoring
- Persistent timers (run on next boot if missed)

## Definition Of Done

- [ ] All 4 systemd files created
- [ ] Services installed: \`systemctl --user daemon-reload\`
- [ ] Timers enabled: \`systemctl --user enable --now anqr-linear-export.timer anqr-rag-rebuild-linear.timer\`
- [ ] Manual trigger test: \`systemctl --user start anqr-linear-export.service\`
- [ ] Journal logs show successful execution
- [ ] Next scheduled runs visible: \`systemctl --user list-timers\`

## Verification

\`\`\`bash
# Install and enable services
systemctl --user daemon-reload
systemctl --user enable --now anqr-linear-export.timer
systemctl --user enable --now anqr-rag-rebuild-linear.timer

# Test manual execution
systemctl --user start anqr-linear-export.service
systemctl --user start anqr-rag-rebuild-linear.service

# Check logs
journalctl --user -u anqr-linear-export.service -n 50
journalctl --user -u anqr-rag-rebuild-linear.service -n 50

# Verify next scheduled runs
systemctl --user list-timers | grep linear
\`\`\`

## Evidence Payload

- Systemd service and timer files
- \`systemctl list-timers\` output showing next runs
- Journal logs from manual test run
- Commands run with results
- Commit hash

## Dependencies

- Depends on ANQ-1121 (export script)
- Depends on ANQ-1122 (RAG builder script)
- Blocks ANQ-1124 (search integration needs index)

## Estimated Effort

1 point (~30 minutes)`,
    priority: 1,
    estimate: 1,
  },
  {
    title: "Linear Issue Search Integration (ANQ-1120 Phase 1.4)",
    description: `## Summary

Add Linear issue search capability to Symphony agents via new search tool or hybrid search integration.

**Parent:** ANQ-1120 (Linear Issue RAG Integration Investigation)

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`scripts/ops/lib/search/linear-search.mjs\` (NEW) OR
- \`scripts/ops/lib/search/hybrid-search.mjs\` (MODIFY)
- \`scripts/ops/runtime/symphony/symphony-agent.mjs\` (MODIFY - add tool)

## Current State

Agents cannot search Linear issues. No search interface to Linear RAG index.

## Target State

Agents can search Linear issues via:
- **Option A:** New \`search_linear_issues\` tool (explicit, focused)
- **Option B:** Blended results in existing hybrid search (implicit, broad)

**Recommendation:** Start with Option A (explicit tool) for observability and control.

## Implementation Details

### Linear Search Function

\`\`\`javascript
// scripts/ops/lib/search/linear-search.mjs
import { loadIndex, vectorSearch } from '../rag/vector-store.mjs';

const LINEAR_INDEX_DIR = 'reports/rag-index-linear';

let linearIndex = null;

async function ensureLinearIndex() {
  if (!linearIndex) {
    linearIndex = await loadIndex(LINEAR_INDEX_DIR);
  }
  return linearIndex;
}

export async function searchLinearIssues(query, topK = 5) {
  const index = await ensureLinearIndex();
  const results = await vectorSearch(index, query, topK);
  
  return results.map(r => ({
    identifier: r.metadata.identifier,
    title: extractTitle(r.content),
    state: r.metadata.state,
    priority: r.metadata.priority,
    score: r.score,
    excerpt: r.content.slice(0, 300),
  }));
}
\`\`\`

### Symphony Agent Tool Integration

\`\`\`javascript
// In symphony-agent.mjs tools array
{
  name: "search_linear_issues",
  description: "Search Linear issues by semantic similarity to a query. Returns relevant issues with metadata.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g., 'validation errors', 'RAG integration')",
      },
      limit: {
        type: "number",
        description: "Maximum results to return (default: 5)",
        default: 5,
      },
    },
    required: ["query"],
  },
  async execute({ query, limit = 5 }) {
    const results = await searchLinearIssues(query, limit);
    return JSON.stringify(results, null, 2);
  },
}
\`\`\`

## Constraints

- Explicit tool (agents must choose to search Linear)
- Return top 5 results by default
- Include issue metadata (state, priority) for filtering
- Provide excerpt for context preview

## Definition Of Done

- [ ] \`linear-search.mjs\` created with search function
- [ ] \`search_linear_issues\` tool added to Symphony agent
- [ ] Manual test via CLI shows results
- [ ] Agent can successfully call tool in test scenario
- [ ] Tool returns JSON with identifier, title, state, excerpt

## Verification

\`\`\`bash
# Test search function directly
node -e "import('./scripts/ops/lib/search/linear-search.mjs').then(m => m.searchLinearIssues('validation').then(console.log))"

# Expected output:
# [
#   {
#     "identifier": "ANQ-1120",
#     "title": "Linear Issue RAG Integration Investigation",
#     "state": "Done",
#     "priority": 1,
#     "score": 0.87,
#     "excerpt": "# ANQ-1120: Linear Issue RAG Integration..."
#   }
# ]

# Test Symphony agent tool (manual orchestration test)
# Create test issue that requires Linear search
# Verify agent calls search_linear_issues tool
\`\`\`

## Evidence Payload

- Search function source code
- Tool definition in symphony-agent.mjs
- CLI test results showing search output
- Agent test showing tool usage
- Commands run with results
- Commit hash

## Dependencies

- Depends on ANQ-1123 (needs Linear RAG index)

## Estimated Effort

2 points (~1 hour)`,
    priority: 1,
    estimate: 2,
  },
  {
    title: "Linear RAG Phase 1 Validation & Monitoring (ANQ-1120 Phase 1.5)",
    description: `## Summary

Validate Phase 1 implementation and establish monitoring for Linear RAG pipeline.

**Parent:** ANQ-1120 (Linear Issue RAG Integration Investigation)

## Scope Class

\`docs-harness\`

## Owned Surfaces

- \`docs/harness/evidence/ANQ-1120-phase1-validation.md\` (NEW)
- Nightly ops report (MODIFY to include Linear RAG stats)

## Current State

No validation or monitoring for Linear RAG pipeline.

## Target State

Validated Phase 1 delivery with ongoing monitoring:
- Export/index runs nightly without errors
- Agents can successfully search Linear issues
- Metrics tracked in nightly ops report

## Validation Checklist

### 1. Export Pipeline
- [ ] \`anqr-linear-export.timer\` scheduled correctly
- [ ] Manual run completes without errors
- [ ] Export JSON contains expected issue count (200-500)
- [ ] Canceled issues excluded
- [ ] JSON format valid

### 2. RAG Index Pipeline
- [ ] \`anqr-rag-rebuild-linear.timer\` scheduled correctly
- [ ] Manual run completes in <2 minutes
- [ ] Index contains expected chunk count (200-500)
- [ ] Index metadata valid
- [ ] Embeddings generated successfully

### 3. Search Integration
- [ ] CLI search test returns relevant results
- [ ] Symphony agent has \`search_linear_issues\` tool
- [ ] Agent can call tool successfully
- [ ] Results include metadata (identifier, state, priority)

### 4. End-to-End Test
- [ ] Create test issue: "Find prior work on validation errors"
- [ ] Agent calls \`search_linear_issues("validation errors")\`
- [ ] Results include relevant issues (e.g., ANQ-1120)
- [ ] Agent cites Linear issues in response

## Monitoring Integration

### Nightly Ops Report Additions

\`\`\`javascript
// In scripts/ops/reporting/harness-report.mjs
// Add Linear RAG section

const linearExportStatus = checkServiceStatus('anqr-linear-export.service');
const linearIndexStatus = checkServiceStatus('anqr-rag-rebuild-linear.service');

const linearStats = {
  exportedIssues: getExportedIssueCount(),
  indexedChunks: getLinearIndexChunkCount(),
  lastExport: getLastExportTime(),
  lastIndex: getLastIndexTime(),
};

// Include in daily report
\`\`\`

## Success Criteria (from ANQ-1120)

- ✅ Linear export runs nightly without errors
- ✅ Linear RAG index builds in <2 min
- ✅ Agents can search Linear issues via tool call
- ✅ At least 1 successful agent use case documented

## Definition Of Done

- [ ] All validation checklist items passing
- [ ] End-to-end test completed with evidence
- [ ] Monitoring added to nightly ops report
- [ ] Phase 1 validation document created
- [ ] Decision made: proceed to Phase 2 or iterate

## Verification

\`\`\`bash
# Check systemd timer health
systemctl --user list-timers | grep linear

# Manual pipeline test
systemctl --user start anqr-linear-export.service
systemctl --user start anqr-rag-rebuild-linear.service

# Verify outputs
cat reports/linear-export/issues-latest.json | jq 'length'
cat reports/rag-index-linear/meta.json | jq

# Test search
node -e "import('./scripts/ops/lib/search/linear-search.mjs').then(m => m.searchLinearIssues('validation').then(console.log))"

# Run nightly ops report
node scripts/ops/reporting/harness-report.mjs
\`\`\`

## Evidence Payload

- Validation checklist results (all items)
- End-to-end test transcript
- Nightly ops report with Linear RAG stats
- Service logs showing successful runs
- Decision: Phase 2 go/no-go
- Commands run with results
- Commit hash

## Dependencies

- Depends on ANQ-1121, ANQ-1122, ANQ-1123, ANQ-1124 (all Phase 1 components)

## Phase 2 Trigger Criteria

Proceed to Phase 2 (comments + transitions) if:
- ❌ Agents frequently cite wrong issue due to missing comment context
- ❌ Agents ask "what was the outcome of ANQ-XXX?" indicating need for transitions
- ❌ Manual review finds >3 cases where comment context would have helped

Otherwise: Phase 1 complete, monitor for 2 weeks before deciding.

## Estimated Effort

2 points (~1 hour validation + monitoring setup)`,
    priority: 1,
    estimate: 2,
  },
];

async function main() {
  console.log("Creating Linear RAG integration issues (ANQ-1120 implementation)...\n");

  const created = [];
  for (const group of issueGroups) {
    try {
      const issue = await createIssue({
        title: group.title,
        description: group.description,
        stateId: STATES.todo,
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
  console.log(`\n📈 Phase 1 Implementation:`)
  console.log(`   Parent: ANQ-1120 (Linear Issue RAG Integration Investigation)`);
  console.log(`   Status: PROCEED with phased implementation`);
  console.log(`   Total effort: ${issueGroups.reduce((sum, g) => sum + g.estimate, 0)} story points`);
  console.log(`   Estimated delivery: 1 sprint (6-8 hours focused work)`);
  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. Review created issues in Linear`);
  console.log(`   2. Assign to appropriate sprint`);
  console.log(`   3. Begin with ANQ-1121 (Export Script)`);
}

await main();
