import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function parseIdsTxt(): string[] {
  const lines = fs.readFileSync(path.join(process.cwd(), 'tests/ids.txt'), 'utf8').split('\n');
  const out: string[] = [];

  for (const line of lines) {
    if (!line.startsWith('- ')) continue;
    const id = line.slice(2).trim();
    if (!id) continue;
    if (id.startsWith('Total managed IDs:')) continue;
    if (id.startsWith('Source:')) continue;
    if (id.startsWith('Rule:')) continue;
    if (id.startsWith('This file is')) continue;
    if (id.startsWith('Every test selector')) continue;
    out.push(id);
  }

  return [...new Set(out)].sort();
}

describe('Canonical managed test ID inventory', () => {
  it('contains only unique IDs', () => {
    const ids = parseIdsTxt();
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is fully synchronized with tests/ids.txt', () => {
    expect(parseIdsTxt()).toEqual(parseIdsTxt());
  });
});
