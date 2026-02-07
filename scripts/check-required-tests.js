#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_FILE = path.join(ROOT, 'tests/required.txt');

const ALLOWED_BASES = new Set(
  (process.env.REQUIRED_ALLOWED_BASES || 'direct-id')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);

function main() {
  if (!fs.existsSync(REQUIRED_FILE)) {
    console.error('Missing tests/required.txt. Run `npm run test:required` first.');
    process.exit(1);
  }

  const lines = fs.readFileSync(REQUIRED_FILE, 'utf8').split('\n');
  let currentId = '';
  const violations = [];
  let totalRequirements = 0;

  for (const line of lines) {
    if (line.startsWith('ID: ')) {
      currentId = line.slice(4).trim();
      continue;
    }

    const reqMatch = line.match(/^\s*-\s*T(\d+)\s+.*->\s+(.+)\s+\[([^\]]+)\]\s*$/);
    if (!reqMatch) continue;

    totalRequirements += 1;
    const typeNum = reqMatch[1];
    const file = reqMatch[2].trim();
    const basis = reqMatch[3].trim();

    if (!ALLOWED_BASES.has(basis)) {
      violations.push({
        id: currentId,
        type: `T${typeNum}`,
        file,
        basis,
      });
    }
  }

  if (violations.length > 0) {
    console.error(
      `Strict required-test validation failed: ${violations.length}/${totalRequirements} requirements are not in allowed bases: ${[...ALLOWED_BASES].join(', ')}`
    );
    for (const v of violations.slice(0, 200)) {
      console.error(`- ${v.id} ${v.type} -> ${v.file} [${v.basis}]`);
    }
    if (violations.length > 200) {
      console.error(`... and ${violations.length - 200} more`);
    }
    process.exit(1);
  }

  console.log(
    `Strict required-test validation passed (${totalRequirements} requirements, allowed bases: ${[...ALLOWED_BASES].join(', ')})`
  );
}

main();
