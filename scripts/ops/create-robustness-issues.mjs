#!/usr/bin/env node

/**
 * Create Linear issues for the 5 architectural robustness improvements
 * identified in the provider failure cascade analysis.
 *
 * Usage: node scripts/ops/create-robustness-issues.mjs
 *
 * Requires: LINEAR_API_KEY environment variable.
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
if (!LINEAR_API_KEY) {
  console.error('LINEAR_API_KEY is required');
  process.exit(1);
}

const gql = createGql(LINEAR_API_KEY);

const ISSUES = [
  {
    title: '[PARENT] In-session provider failover in model-injector proxy',
    priority: 2,
    description: [
      '## Problem',
      '',
      'When a provider fails mid-session (429/413/500), the model-injector writes a cooldown file but the current Codex session remains bound to the dead provider. The circuit breaker now blocks requests, but the agent session still fails — it cannot transparently switch to a healthy provider.',
      '',
      '## Desired Behaviour',
      '',
      'The model-injector should maintain its own provider fallback chain. When a request fails:',
      '1. Write cooldown for the failed provider (already done)',
      '2. Select the next available non-cooled-down provider from a priority list',
      '3. Update `current-model` to the new provider',
      '4. Replay the failed request against the new provider transparently',
      '',
      '## Implementation Notes',
      '',
      '- Requires the model-injector to know the LiteLLM model name mapping (currently only the credit-gate has this)',
      '- Need in-memory health state tracking per provider',
      '- Request replay must handle body decompression/recompression',
      '- Must avoid infinite failover loops (limit to N retries)',
      '',
      '## Validation',
      '',
      '```bash',
      'python3 -c "import py_compile; py_compile.compile(\'scripts/ops/model-injector-proxy.py\', doraise=True)"',
      '```',
    ].join('\n'),
  },
  {
    title: '[PARENT] Circuit breaker with escalating cooldowns',
    priority: 2,
    description: [
      '## Problem',
      '',
      'Currently each error type has a fixed cooldown duration. If a provider fails 3 times in a row (e.g., Gemini quota, SambaNova rate limits), the cooldown resets to the same fixed value each time. This means providers get retried too frequently when they are persistently failing.',
      '',
      '## Desired Behaviour',
      '',
      'Implement escalating cooldowns: if provider fails N times within a window, double the cooldown each time:',
      '- 1st failure: base cooldown (e.g., 120s)',
      '- 2nd failure: 2x (240s)',
      '- 3rd failure: 4x (480s)',
      '- Cap at max (e.g., 3600s)',
      '',
      '## Implementation Notes',
      '',
      '- Requires coordinated state file format change: cooldown files need an "escalation level" field',
      '- Both model-injector-proxy.py (writes) and codex-credit-gate.sh (reads) must agree on format',
      '- Consider JSON format for cooldown files instead of plain timestamp',
      '',
      '## Validation',
      '',
      '```bash',
      'python3 -c "import py_compile; py_compile.compile(\'scripts/ops/model-injector-proxy.py\', doraise=True)"',
      '```',
    ].join('\n'),
  },
  {
    title: '[PARENT] Pre-session provider health check in credit-gate',
    priority: 2,
    description: [
      '## Problem',
      '',
      'The credit-gate selects a provider and spawns Codex, but if ALL providers are rate-limited/broken, the session starts and immediately fails — burning an empty turn and incrementing retry counters. This wastes Symphony resources and accelerates the death spiral.',
      '',
      '## Desired Behaviour',
      '',
      'Before spawning Codex, verify at least one provider is actually healthy:',
      '1. Check all cooldown files — if ALL providers are cooled down, sleep until the earliest cooldown expires',
      '2. Optionally probe the selected provider with a lightweight request (existing GET /v1/models probe)',
      '3. Only exec Codex when a healthy provider is confirmed',
      '',
      '## Implementation Notes',
      '',
      '- The credit-gate already has `find_earliest_cooldown()` and rate-limit wait logic',
      '- But currently it waits at the END of the cascade, after already trying all providers',
      '- Move the "all exhausted" wait to the TOP of the loop, before attempting any provider',
      '- Needs integration testing with Symphony\'s own retry/backoff logic to avoid double-sleeping',
      '',
      '## Validation',
      '',
      '```bash',
      'bash -n scripts/ops/codex-credit-gate.sh',
      '```',
    ].join('\n'),
  },
  {
    title: '[PARENT] Symphony slot-contention should not burn retry attempts',
    priority: 2,
    description: [
      '## Problem',
      '',
      'With `max_concurrent_agents: 1`, when the single slot is occupied, all other issues get "no available orchestrator slots" error and go into exponential backoff. These slot-contention errors increment the retry counter (attempt=10, 11, 12...) and may cause issues to be abandoned after max retries, even though the issue was never actually attempted.',
      '',
      '## Desired Behaviour',
      '',
      '"No available orchestrator slots" is structural, not transient — the issue was never attempted. Either:',
      '1. Don\'t count slot-contention as a retry attempt',
      '2. Use a separate, gentler backoff for slot-contention (e.g., fixed 60s instead of exponential)',
      '3. Increase `max_retry_backoff_ms` to give slot-bound issues more time',
      '',
      '## Implementation Notes',
      '',
      '- This may require upstream Symphony changes (Elixir orchestrator)',
      '- Alternative: adjust `max_retry_backoff_ms` in WORKFLOW-3B.md from 600000 to a larger value',
      '- Consider whether `max_concurrent_agents` should be 2 instead of 1 (requires more memory/GPU)',
      '',
      '## Validation',
      '',
      'Observe Symphony dashboard during a multi-issue run — slot-contention should not rapidly exhaust retry attempts.',
    ].join('\n'),
  },
  {
    title: '[PARENT] Provider quota tracking in harness report',
    priority: 3,
    description: [
      '## Problem',
      '',
      'The harness report checks 22 domains but does not monitor provider quota consumption. Providers like Gemini (20 req/day), SambaNova (20 req/day), and Cerebras (1M tok/day) have hard limits that are invisible until exhausted. By the time the model-injector detects the failure, the quota is already gone.',
      '',
      '## Desired Behaviour',
      '',
      'Add a `provider_health` check domain to the harness report that:',
      '1. Reads all cooldown files and reports their status',
      '2. Queries LiteLLM `/health` for healthy/unhealthy endpoints',
      '3. Counts per-provider errors from model-injector logs (journalctl)',
      '4. Warns when a provider has been cooled down more than N times in 24hr',
      '5. Tracks daily request counts per provider (from proxy logs)',
      '',
      '## Implementation Notes',
      '',
      '- New check in `scripts/ops/harness-report.mjs`',
      '- Parse journalctl output from `model-injector-proxy.service`',
      '- Read cooldown files from `$XDG_RUNTIME_DIR/credit-gate/ratelimit-*`',
      '- Query `http://localhost:4010/health` for LiteLLM health status',
      '- Add to the `continuous` profile (check every hour)',
      '',
      '## Validation',
      '',
      '```bash',
      'node --check scripts/ops/harness-report.mjs && make harness:quick',
      '```',
    ].join('\n'),
  },
];

async function main() {
  const teamData = await gql(
    `query($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 1) {
        nodes {
          id
          projects(first: 100) { nodes { id name } }
          labels(first: 200) { nodes { id name } }
        }
      }
    }`,
    { key: 'ANQ' },
  );

  const team = teamData.teams.nodes[0];
  if (!team) {
    console.error('Team ANQ not found');
    process.exit(1);
  }

  const symphonyProject = team.projects.nodes.find((p) => p.name === 'Symphony');
  if (!symphonyProject) {
    console.error('Symphony project not found');
    process.exit(1);
  }

  const reliabilityLabel = team.labels.nodes.find(
    (l) => l.name.toLowerCase() === 'reliability',
  );

  console.log(`Team: ${team.id}`);
  console.log(`Project: ${symphonyProject.name} (${symphonyProject.id})`);
  console.log(`Label: ${reliabilityLabel?.name || '(none)'} (${reliabilityLabel?.id || 'n/a'})`);
  console.log();

  for (const issue of ISSUES) {
    const result = await gql(
      `mutation($input: IssueCreateInput!) {
        issueCreate(input: $input) { success issue { identifier title } }
      }`,
      {
        input: {
          teamId: team.id,
          title: issue.title,
          description: issue.description,
          projectId: symphonyProject.id,
          priority: issue.priority,
          ...(reliabilityLabel ? { labelIds: [reliabilityLabel.id] } : {}),
        },
      },
    );

    const created = result.issueCreate?.issue;
    if (created) {
      console.log(`✅ ${created.identifier}: ${created.title}`);
    } else {
      console.error(`❌ Failed to create: ${issue.title}`);
    }
  }

  console.log('\nDone. Created 5 architectural robustness issues.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
