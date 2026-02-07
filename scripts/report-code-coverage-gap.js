#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SUMMARY_PATH = path.join(ROOT, 'coverage', 'coverage-summary.json');
const OUT_JSON = path.join(ROOT, 'reports', 'coverage-gap.json');
const OUT_MD = path.join(ROOT, 'reports', 'coverage-gap.md');

function pct(v) {
  return Number(v || 0);
}

function missesForMetric(metric) {
  return Math.max(0, Number(metric?.total || 0) - Number(metric?.covered || 0));
}

function main() {
  if (!fs.existsSync(SUMMARY_PATH)) {
    console.error(`Missing ${path.relative(ROOT, SUMMARY_PATH)}. Run unit coverage first.`);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));
  const totals = summary.total || {};
  const fileRows = [];

  for (const [file, data] of Object.entries(summary)) {
    if (file === 'total') continue;
    const statements = pct(data.statements?.pct);
    const branches = pct(data.branches?.pct);
    const functions = pct(data.functions?.pct);
    const lines = pct(data.lines?.pct);
    const minPct = Math.min(statements, branches, functions, lines);

    fileRows.push({
      file: file.replace(`${ROOT}/`, ''),
      statements,
      branches,
      functions,
      lines,
      minPct,
      missed: {
        statements: missesForMetric(data.statements),
        branches: missesForMetric(data.branches),
        functions: missesForMetric(data.functions),
        lines: missesForMetric(data.lines),
      },
    });
  }

  fileRows.sort((a, b) => a.minPct - b.minPct || a.file.localeCompare(b.file));

  const out = {
    generatedAt: new Date().toISOString(),
    total: {
      statements: pct(totals.statements?.pct),
      branches: pct(totals.branches?.pct),
      functions: pct(totals.functions?.pct),
      lines: pct(totals.lines?.pct),
      missed: {
        statements: missesForMetric(totals.statements),
        branches: missesForMetric(totals.branches),
        functions: missesForMetric(totals.functions),
        lines: missesForMetric(totals.lines),
      },
    },
    filesBelow100: fileRows.filter(
      (r) => r.statements < 100 || r.branches < 100 || r.functions < 100 || r.lines < 100
    ),
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`);

  const md = [];
  md.push('# Code Coverage Gap Report');
  md.push('');
  md.push(
    `- Total: statements ${out.total.statements}% | branches ${out.total.branches}% | functions ${out.total.functions}% | lines ${out.total.lines}%`
  );
  md.push(
    `- Missed totals: statements ${out.total.missed.statements}, branches ${out.total.missed.branches}, functions ${out.total.missed.functions}, lines ${out.total.missed.lines}`
  );
  md.push(`- Files below 100%: ${out.filesBelow100.length}`);
  md.push('');
  md.push('## Worst Files (Top 200)');
  for (const row of out.filesBelow100.slice(0, 200)) {
    md.push(
      `- ${row.file} | stmt ${row.statements}% | br ${row.branches}% | fn ${row.functions}% | ln ${row.lines}%`
    );
  }
  if (out.filesBelow100.length > 200) {
    md.push(`- ... and ${out.filesBelow100.length - 200} more`);
  }
  md.push('');

  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`);
  console.log(
    `Wrote ${path.relative(ROOT, OUT_JSON)} and ${path.relative(ROOT, OUT_MD)} (${out.filesBelow100.length} files below 100%)`
  );
}

main();
