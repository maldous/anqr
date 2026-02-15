#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = process.cwd();
const reportsDir = path.join(repoRoot, 'reports');
const artifactsDir = path.join(reportsDir, 'gallery-artifacts');
const scenarioSourcePath = path.join(repoRoot, 'src/data/gallery-scan-scenarios.ts');
const MATRIX_SPEC = 'tests/unit/gallery-scan-matrix.spec.ts';

function parseBool(raw, fallback) {
  if (!raw) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return fallback;
}

function parsePositiveInt(raw) {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function readScenarioIds() {
  const src = await fs.readFile(scenarioSourcePath, 'utf8');
  const start = src.indexOf('export const GALLERY_SCAN_SCENARIOS');
  if (start < 0) {
    throw new Error('Unable to locate GALLERY_SCAN_SCENARIOS export');
  }
  const end = src.indexOf('\n];', start);
  if (end < 0) {
    throw new Error('Unable to locate end of GALLERY_SCAN_SCENARIOS array');
  }
  const body = src.slice(start, end);
  const ids = [];
  const re = /\bid:\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    ids.push(match[1]);
  }
  const unique = [...new Set(ids)];
  if (unique.length === 0) {
    throw new Error('No scenario ids discovered from gallery-scan-scenarios.ts');
  }
  return unique;
}

function chunkRoundRobin(items, shardCount) {
  const shards = Array.from({ length: shardCount }, () => []);
  for (let i = 0; i < items.length; i++) {
    shards[i % shardCount].push(items[i]);
  }
  return shards.filter((s) => s.length > 0);
}

function runShard({ index, total, scenarioIds }) {
  return new Promise((resolve, reject) => {
    const suffix = `shard-${index + 1}-of-${total}`;
    const startedAt = Date.now();
    const child = spawn(
      'npx',
      ['vitest', 'run', '--maxWorkers=1', MATRIX_SPEC],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          ANQR_LOG_LEVEL: process.env.ANQR_LOG_LEVEL ?? 'error',
          SCAN_MATRIX_SCENARIOS: scenarioIds.join(','),
          SCAN_MATRIX_CLEAN_ARTIFACTS: '0',
          SCAN_MATRIX_OUTPUT_SUFFIX: suffix,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      const tookSec = ((Date.now() - startedAt) / 1000).toFixed(1);
      if (code === 0) {
        console.log(
          `[matrix shard ${index + 1}/${total}] pass (${scenarioIds.length} scenarios, ${tookSec}s)`
        );
        resolve({ suffix, stdout, stderr });
        return;
      }

      console.error(`[matrix shard ${index + 1}/${total}] failed (exit ${code ?? 'null'})`);
      if (stdout.trim().length > 0) {
        console.error('--- shard stdout ---');
        console.error(stdout);
      }
      if (stderr.trim().length > 0) {
        console.error('--- shard stderr ---');
        console.error(stderr);
      }
      reject(new Error(`Shard ${index + 1}/${total} failed`));
    });
  });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function buildTierFixtureTable(tierResults, fixtures) {
  const byFixture = new Map();
  for (const fixture of fixtures) {
    byFixture.set(fixture.id, { pass: 0, fail: 0 });
  }
  for (const result of tierResults) {
    const row = byFixture.get(result.fixtureId);
    if (!row) continue;
    if (result.status === 'pass') row.pass++;
    else row.fail++;
  }
  const lines = ['| Fixture | Pass | Fail |', '| --- | ---: | ---: |'];
  for (const fixture of fixtures) {
    const row = byFixture.get(fixture.id);
    lines.push(`| ${fixture.id} | ${row.pass} | ${row.fail} |`);
  }
  return lines.join('\n');
}

function buildTierFailTable(tierResults) {
  const fails = tierResults.filter((r) => r.status === 'fail');
  if (fails.length === 0) return '_None_';
  const lines = [
    '| Scenario | Fixture | Reason | Disposition |',
    '| --- | --- | --- | --- |',
  ];
  for (const result of fails) {
    lines.push(
      `| ${result.scenarioId} | ${result.fixtureId} | ${result.reasonCode} | ${result.disposition} |`
    );
  }
  return lines.join('\n');
}

function buildSummaryMarkdown(allResults, scenarios, fixtures, tiers) {
  const tierA = tiers.find((t) => t.id === 'tier-a') ?? {
    id: 'tier-a',
    label: 'Production',
    description: 'Production-like settings with scan gate retry',
  };
  const tierB = tiers.find((t) => t.id === 'tier-b') ?? {
    id: 'tier-b',
    label: 'Diagnostic',
    description: 'Intrinsic scannability without scan gate assistance',
  };

  const tierAResults = allResults.filter((r) => r.tier === 'tier-a');
  const tierBResults = allResults.filter((r) => r.tier === 'tier-b');
  const tierAPass = tierAResults.filter((r) => r.status === 'pass').length;
  const tierAFail = tierAResults.length - tierAPass;
  const tierBPass = tierBResults.filter((r) => r.status === 'pass').length;
  const tierBFail = tierBResults.length - tierBPass;

  const rescued = [];
  for (const a of tierAResults) {
    if (a.status !== 'pass') continue;
    const b = tierBResults.find(
      (r) => r.scenarioId === a.scenarioId && r.fixtureId === a.fixtureId
    );
    if (b && b.status === 'fail') {
      rescued.push({ scenarioId: a.scenarioId, fixtureId: a.fixtureId });
    }
  }

  const lines = [
    '# Gallery Scan Matrix Summary',
    '',
    '## Overview',
    '',
    `- Total runs: ${allResults.length} (${tierAResults.length} per tier × ${tiers.length} tiers)`,
    `- **Tier A (${tierA.label}):** ${tierAPass} pass / ${tierAFail} fail (${Math.round((tierAPass * 100) / (tierAResults.length || 1))}%)`,
    `- **Tier B (${tierB.label}):** ${tierBPass} pass / ${tierBFail} fail (${Math.round((tierBPass * 100) / (tierBResults.length || 1))}%)`,
    `- Scan-gate-rescued: ${rescued.length} scenario×fixture pairs`,
    '',
    `## Tier A — ${tierA.label}`,
    '',
    `> ${tierA.description}`,
    '',
    '### By Fixture',
    '',
    buildTierFixtureTable(tierAResults, fixtures),
    '',
    '### Failing Cases',
    '',
    buildTierFailTable(tierAResults),
    '',
    `## Tier B — ${tierB.label}`,
    '',
    `> ${tierB.description}`,
    '',
    '### By Fixture',
    '',
    buildTierFixtureTable(tierBResults, fixtures),
    '',
    '### Failing Cases',
    '',
    buildTierFailTable(tierBResults),
    '',
    '## Comparison',
    '',
    '| Scenario | Fixture | Tier A | Tier B | Delta |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const scenario of scenarios) {
    for (const fixture of fixtures) {
      const a = tierAResults.find(
        (r) => r.scenarioId === scenario.id && r.fixtureId === fixture.id
      );
      const b = tierBResults.find(
        (r) => r.scenarioId === scenario.id && r.fixtureId === fixture.id
      );
      const aStatus = a?.status ?? '—';
      const bStatus = b?.status ?? '—';
      let delta = '';
      if (aStatus === 'pass' && bStatus === 'fail') delta = '🟢 rescued';
      else if (aStatus === 'fail' && bStatus === 'pass') delta = '🔴 regression';
      else if (aStatus === 'pass' && bStatus === 'pass') delta = '✅ both pass';
      else if (aStatus === 'fail' && bStatus === 'fail') delta = '❌ both fail';
      lines.push(`| ${scenario.id} | ${fixture.id} | ${aStatus} | ${bStatus} | ${delta} |`);
    }
  }

  lines.push('');
  lines.push('## Scan-Gate-Rescued');
  lines.push('');
  lines.push('Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:');
  lines.push('');
  if (rescued.length === 0) {
    lines.push('_None — all Tier A passes also pass in Tier B._');
  } else {
    lines.push('| Scenario | Fixture |');
    lines.push('| --- | --- |');
    for (const r of rescued) {
      lines.push(`| ${r.scenarioId} | ${r.fixtureId} |`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function toTierStats(results, tierId) {
  const tierResults = results.filter((r) => r.tier === tierId);
  const passRuns = tierResults.filter((r) => r.status === 'pass').length;
  return {
    totalRuns: tierResults.length,
    passRuns,
    failRuns: tierResults.length - passRuns,
  };
}

async function main() {
  const allScenarioIds = await readScenarioIds();

  const cpuCount = Math.max(1, os.cpus().length);
  const totalMemGiB = os.totalmem() / (1024 ** 3);
  const estimatedShardGiB = Number.parseFloat(process.env.SCAN_MATRIX_ESTIMATED_SHARD_GIB ?? '10');
  const shardMemCost = Number.isFinite(estimatedShardGiB) && estimatedShardGiB > 0
    ? estimatedShardGiB
    : 10;
  const maxByMem = Math.max(1, Math.floor(totalMemGiB / shardMemCost));
  const defaultShardCount = Math.max(
    1,
    Math.min(cpuCount, allScenarioIds.length, maxByMem)
  );
  const requestedShards = parsePositiveInt(process.env.SCAN_MATRIX_SHARDS);
  const shardCount = Math.max(
    1,
    Math.min(requestedShards ?? defaultShardCount, allScenarioIds.length)
  );

  const shards = chunkRoundRobin(allScenarioIds, shardCount);
  const keepShardReports = parseBool(process.env.SCAN_MATRIX_KEEP_SHARDS, false);

  console.log(
    `[matrix] scenarios=${allScenarioIds.length}, shards=${shards.length}, cpu=${cpuCount}, mem=${totalMemGiB.toFixed(1)}GiB, est_shard_mem=${shardMemCost.toFixed(1)}GiB`
  );

  await fs.rm(artifactsDir, { recursive: true, force: true });
  await fs.mkdir(artifactsDir, { recursive: true });

  const suffixes = shards.map((_, i) => `shard-${i + 1}-of-${shards.length}`);
  for (const suffix of suffixes) {
    await fs.rm(path.join(reportsDir, `gallery-scan-matrix.${suffix}.json`), { force: true });
    await fs.rm(path.join(reportsDir, `gallery-scan-summary.${suffix}.md`), { force: true });
  }

  await Promise.all(
    shards.map((scenarioIds, i) =>
      runShard({ index: i, total: shards.length, scenarioIds })
    )
  );

  const shardMatrices = await Promise.all(
    suffixes.map((suffix) =>
      readJson(path.join(reportsDir, `gallery-scan-matrix.${suffix}.json`))
    )
  );

  const tiers = shardMatrices[0]?.tiers ?? [];
  const fixtures = shardMatrices[0]?.fixtures ?? [];

  const scenarioMeta = new Map();
  for (const matrix of shardMatrices) {
    for (const scenario of matrix.scenarios ?? []) {
      scenarioMeta.set(scenario.id, scenario);
    }
  }

  const scenarios = allScenarioIds
    .map((id) => scenarioMeta.get(id))
    .filter((s) => Boolean(s));

  const tierOrder = new Map(tiers.map((t, i) => [t.id, i]));
  const scenarioOrder = new Map(scenarios.map((s, i) => [s.id, i]));
  const fixtureOrder = new Map(fixtures.map((f, i) => [f.id, i]));

  const results = shardMatrices
    .flatMap((m) => m.results ?? [])
    .sort((a, b) => {
      const td = (tierOrder.get(a.tier) ?? 99) - (tierOrder.get(b.tier) ?? 99);
      if (td !== 0) return td;
      const sd = (scenarioOrder.get(a.scenarioId) ?? 99) - (scenarioOrder.get(b.scenarioId) ?? 99);
      if (sd !== 0) return sd;
      return (fixtureOrder.get(a.fixtureId) ?? 99) - (fixtureOrder.get(b.fixtureId) ?? 99);
    });

  const byScenarioTierA = new Map();
  for (const result of results) {
    if (result.tier !== 'tier-a') continue;
    const arr = byScenarioTierA.get(result.scenarioId) ?? [];
    arr.push(result);
    byScenarioTierA.set(result.scenarioId, arr);
  }

  const galleryCandidates = Array.from(byScenarioTierA.entries())
    .map(([scenarioId, runs]) => {
      const passRuns = runs.filter((r) => r.status === 'pass');
      if (passRuns.length === 0) return null;
      passRuns.sort((a, b) => a.durationMs - b.durationMs);
      const meta = scenarioMeta.get(scenarioId);
      return {
        scenarioId,
        selectedFixtureId: passRuns[0].fixtureId,
        isAnimated: passRuns[0].isAnimated,
        heroPriority: meta?.heroPriority ?? 0,
        galleryEligible: meta?.galleryEligible ?? false,
        artifactPath: passRuns[0].artifactPath,
        status: passRuns[0].status,
      };
    })
    .filter((x) => x !== null)
    .sort((a, b) => b.heroPriority - a.heroPriority);

  const mergedMatrix = {
    generatedAt: new Date().toISOString(),
    tiers,
    scenarios,
    fixtures,
    totalRuns: results.length,
    tierA: toTierStats(results, 'tier-a'),
    tierB: toTierStats(results, 'tier-b'),
    results,
    galleryCandidates,
  };

  await fs.writeFile(
    path.join(reportsDir, 'gallery-scan-matrix.json'),
    JSON.stringify(mergedMatrix, null, 2)
  );
  await fs.writeFile(
    path.join(reportsDir, 'gallery-scan-summary.md'),
    buildSummaryMarkdown(results, scenarios, fixtures, tiers)
  );

  if (!keepShardReports) {
    for (const suffix of suffixes) {
      await fs.rm(path.join(reportsDir, `gallery-scan-matrix.${suffix}.json`), { force: true });
      await fs.rm(path.join(reportsDir, `gallery-scan-summary.${suffix}.md`), { force: true });
    }
  }

  const tierAPass = mergedMatrix.tierA.passRuns;
  const tierAFail = mergedMatrix.tierA.failRuns;
  const tierBPass = mergedMatrix.tierB.passRuns;
  const tierBFail = mergedMatrix.tierB.failRuns;
  console.log(
    `[matrix] merged total=${mergedMatrix.totalRuns} | tierA=${tierAPass}/${tierAPass + tierAFail} | tierB=${tierBPass}/${tierBPass + tierBFail}`
  );
}

main().catch((error) => {
  console.error('[matrix] failed:', error?.stack ?? error);
  process.exitCode = 1;
});
