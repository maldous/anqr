import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const TARGET_SECTIONS = [
  'Output Section',
  'Share Section',
  'Watermark Section',
  'Safety Section',
] as const;

const TRANCHE_IDS = [
  'output-dpi-slider',
  'output-filename-input',
  'output-format-content',
  'output-format-extra-content',
  'output-format-extra-trigger',
  'output-format-trigger',
  'output-gif-dither-content',
  'output-gif-dither-trigger',
  'output-gif-palette-slider',
  'output-gif-quantizer-content',
  'output-gif-quantizer-trigger',
  'output-height-input',
  'output-include-quiet-zone-switch',
  'output-quality-slider',
  'output-svg-embed-raster-switch',
  'output-svg-precision-content',
  'output-svg-precision-trigger',
  'output-svg-true-vector-switch',
  'output-width-input',
  'safety-auto-pick-ecc-switch',
  'safety-auto-pick-version-switch',
  'safety-auto-reduce-intensity-switch',
  'safety-contrast-check-switch',
  'safety-ecc-aware-enabled-switch',
  'safety-ecc-risk-budget-slider',
  'safety-ecc-weight-map-content',
  'safety-ecc-weight-map-trigger',
  'safety-lock-alignment-switch',
  'safety-lock-finders-switch',
  'safety-lock-format-switch',
  'safety-lock-timing-switch',
  'safety-lock-version-switch',
  'safety-min-module-slider',
  'safety-min-quiet-zone-slider',
  'safety-mode-content',
  'safety-mode-trigger',
  'safety-show-heatmap-switch',
  'safety-simulate-blur-slider',
  'safety-simulate-noise-slider',
  'safety-simulate-rotation-slider',
  'share-copy-embed-button',
  'share-copy-link-button',
  'share-copy-markdown-button',
  'share-direct-link-input',
  'share-direct-link-switch',
  'share-embed-code-input',
  'share-embed-html-switch',
  'share-encode-more-params-switch',
  'share-markdown-input',
  'share-quick-copy-button',
  'share-twitter-button',
  'share-whatsapp-button',
  'watermark-blend-content',
  'watermark-blend-trigger',
  'watermark-clear-image-button',
  'watermark-enabled-switch',
  'watermark-kind-content',
  'watermark-kind-trigger',
  'watermark-opacity-slider',
  'watermark-position-content',
  'watermark-position-trigger',
  'watermark-text-input',
  'watermark-upload-button',
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

describe('Required Mapping Tranche 3: Output/Share/Watermark/Safety explicit IDs', () => {
  it('contains non-empty, unique explicit IDs', () => {
    expect(TRANCHE_IDS.length).toBeGreaterThan(0);
    expect(new Set(TRANCHE_IDS).size).toBe(TRANCHE_IDS.length);
  });

  it('stays exactly synchronized with tests/ids.txt target sections', () => {
    expect([...TRANCHE_IDS].sort()).toEqual(parseSectionIds());
  });
});
