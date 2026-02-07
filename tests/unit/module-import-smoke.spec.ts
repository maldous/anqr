import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const INCLUDE_ROOTS = [
  'src/modules',
  'src/lib',
  'src/store',
  'src/i18n/index.ts',
  'src/i18n/static/index.ts',
  'netlify/functions',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (!full.endsWith('.ts')) continue;
    out.push(full);
  }
  return out;
}

function collectTargets(): string[] {
  const files: string[] = [];
  for (const rel of INCLUDE_ROOTS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) files.push(...walk(abs));
    else files.push(abs);
  }
  return [...new Set(files)]
    .filter((f) => !f.endsWith('.d.ts'))
    .sort((a, b) => a.localeCompare(b));
}

describe('Module import smoke', () => {
  it(
    'imports all covered module files without top-level runtime errors',
    async () => {
      const targets = collectTargets();
      const failures: string[] = [];

      for (const file of targets) {
        try {
          await import(pathToFileURL(file).href);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          failures.push(`${path.relative(ROOT, file)} :: ${msg}`);
        }
      }

      expect(failures).toEqual([]);
      expect(targets.length).toBeGreaterThan(0);
    },
    120_000
  );
});
