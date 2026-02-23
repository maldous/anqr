#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_FILE = path.join(ROOT, 'tests/required.txt');
const OUT_JSON = path.join(ROOT, 'reports/required-gap.json');
const OUT_MD = path.join(ROOT, 'reports/required-gap.md');

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function main() {
  if (!fs.existsSync(REQUIRED_FILE)) {
    console.error('Missing tests/required.txt. Run `npm run test:required` first.');
    process.exit(1);
  }

  const lines = fs.readFileSync(REQUIRED_FILE, 'utf8').split('\n');
  let currentId = '';
  let currentDomain = 'unknown';

  const totals = { total: 0, direct: 0, nonDirect: 0 };
  const byBasis = new Map();
  const byType = new Map();
  const byDomain = new Map();
  const nonDirectRows = [];

  for (const line of lines) {
    if (line.startsWith('ID: ')) {
      currentId = line.slice(4).trim();
      continue;
    }
    if (line.startsWith('- inferred-domain: ')) {
      currentDomain = line.replace('- inferred-domain: ', '').trim();
      continue;
    }

    const m = line.match(/^\s*-\s*T(\d+)\s+.*->\s+(.+)\s+\[([^\]]+)\]\s*$/);
    if (!m) continue;

    const type = `T${m[1]}`;
    const file = m[2].trim();
    const basis = m[3].trim();

    totals.total += 1;
    if (basis === 'direct-id') totals.direct += 1;
    else totals.nonDirect += 1;

    byBasis.set(basis, (byBasis.get(basis) || 0) + 1);

    if (!byType.has(type)) byType.set(type, { total: 0, direct: 0, nonDirect: 0 });
    const typeStats = byType.get(type);
    typeStats.total += 1;
    if (basis === 'direct-id') typeStats.direct += 1;
    else typeStats.nonDirect += 1;

    if (!byDomain.has(currentDomain))
      byDomain.set(currentDomain, { total: 0, direct: 0, nonDirect: 0 });
    const domainStats = byDomain.get(currentDomain);
    domainStats.total += 1;
    if (basis === 'direct-id') domainStats.direct += 1;
    else domainStats.nonDirect += 1;

    if (basis !== 'direct-id') {
      nonDirectRows.push({
        id: currentId,
        domain: currentDomain,
        type,
        file,
        basis,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totals,
    byBasis: Object.fromEntries([...byBasis.entries()].sort((a, b) => b[1] - a[1])),
    byType: Object.fromEntries(
      [...byType.entries()].sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
    ),
    byDomain: Object.fromEntries([...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
    nonDirectRows,
  };

  ensureDir(OUT_JSON);
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

  const md = [];
  md.push('# Required Test Mapping Gap Report');
  md.push('');
  md.push(`- Total requirements: ${totals.total}`);
  md.push(`- Direct (` + '`direct-id`' + `): ${totals.direct}`);
  md.push(`- Non-direct: ${totals.nonDirect}`);
  md.push(`- Direct coverage: ${((totals.direct / Math.max(1, totals.total)) * 100).toFixed(1)}%`);
  md.push('');
  md.push('## Basis Breakdown');
  for (const [basis, count] of [...byBasis.entries()].sort((a, b) => b[1] - a[1])) {
    md.push(`- ${basis}: ${count}`);
  }
  md.push('');
  md.push('## Type Breakdown');
  for (const [type, stats] of [...byType.entries()].sort(
    (a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1))
  )) {
    const pct = ((stats.direct / Math.max(1, stats.total)) * 100).toFixed(1);
    md.push(`- ${type}: ${stats.direct}/${stats.total} direct (${pct}%)`);
  }
  md.push('');
  md.push('## Domain Breakdown');
  for (const [domain, stats] of [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const pct = ((stats.direct / Math.max(1, stats.total)) * 100).toFixed(1);
    md.push(`- ${domain}: ${stats.direct}/${stats.total} direct (${pct}%)`);
  }
  md.push('');
  md.push('## Top Non-direct Rows (first 200)');
  for (const row of nonDirectRows.slice(0, 200)) {
    md.push(`- ${row.id} ${row.type} -> ${row.file} [${row.basis}] (domain: ${row.domain})`);
  }
  if (nonDirectRows.length > 200) {
    md.push(`- ... and ${nonDirectRows.length - 200} more`);
  }
  md.push('');

  ensureDir(OUT_MD);
  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`);

  console.log(
    `Wrote ${path.relative(ROOT, OUT_JSON)} and ${path.relative(ROOT, OUT_MD)} (${totals.direct}/${totals.total} direct)`
  );
}

main();
