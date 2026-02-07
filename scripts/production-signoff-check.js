#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  const requiredFiles = [
    'reports/param-parity.json',
    'reports/parity-analysis.md',
    'reports/i18n-regression-baseline.json',
    'reports/production-signoff.md',
    'tests/unit/share-param-parity.spec.ts',
    'tests/unit/scanability-robustness.spec.ts',
    'tests/unit/platform-media-store.spec.ts',
    '.github/workflows/quality.yml',
  ];

  const missing = requiredFiles.filter((f) => !exists(f));
  if (missing.length) {
    console.error('Missing required sign-off artifacts:');
    for (const m of missing) console.error(`- ${m}`);
    process.exit(1);
  }

  const parity = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/param-parity.json'), 'utf8'));
  if ((parity.clientOnly?.length ?? 999) !== 0 || (parity.serverOnly?.length ?? 999) !== 0) {
    console.error('Parity report is not clean (expected zero mismatches).');
    process.exit(1);
  }

  // Execution checks
  run('npm run typecheck');
  run('npm run test:unit:ci');
  run('npm run test:i18n');

  console.log('\nProduction sign-off check passed.');
}

main();
