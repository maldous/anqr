import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SECTIONS = ['QR Encoding Section'] as const;

const EXPLICIT_IDS = [
  'qr-character-encoding-select',
  'qr-ecc-select',
  'qr-encoding-mode-select',
  'qr-mask-pattern-select',
  'qr-quiet-zone-enforce-switch',
  'qr-quiet-zone-slider',
  'qr-version-slider',
] as const;

function parseSectionIds(): string[] {
  const lines = fs.readFileSync(path.join(process.cwd(), 'tests/ids.txt'), 'utf8').split('\n');
  let section = '';
  let sectionNo = 0;
  const out: string[] = [];

  for (const line of lines) {
    const s = line.match(/^(\d+)\)\s+(.*)$/);
    if (s) {
      sectionNo = Number(s[1]);
      section = s[2].trim();
      continue;
    }
    if (sectionNo < 2) continue;
    if (!TARGET_SECTIONS.includes(section as (typeof TARGET_SECTIONS)[number])) continue;
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

describe('Required Mapping Tranche 5: QR encoding explicit IDs', () => {
  it('contains non-empty unique explicit IDs', () => {
    expect(EXPLICIT_IDS.length).toBeGreaterThan(0);
    expect(new Set(EXPLICIT_IDS).size).toBe(EXPLICIT_IDS.length);
  });

  it('stays synchronized with tests/ids.txt', () => {
    expect([...EXPLICIT_IDS].sort()).toEqual(parseSectionIds());
  });
});
