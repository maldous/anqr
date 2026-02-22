import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const TARGET_SECTIONS = ['Overlay Section', 'Render Section', 'Animation Section'] as const;

const TRANCHE_IDS = [
  'animation-bounce-switch',
  'animation-color-cycle-switch',
  'animation-frame-step-slider',
  'animation-interpolation-content',
  'animation-interpolation-trigger',
  'animation-loop-switch',
  'animation-max-frames-slider',
  'animation-module-jitter-slider',
  'animation-pattern-2-content',
  'animation-pattern-2-trigger',
  'animation-pattern-content',
  'animation-pattern-trigger',
  'animation-seed-input',
  'animation-speed-slider',
  'animation-start-frame-slider',
  'animation-target-2-content',
  'animation-target-2-trigger',
  'animation-target-content',
  'animation-target-trigger',
  'animation-temporal-dither-content',
  'animation-temporal-dither-trigger',
  'animation-wave-axis-2-content',
  'animation-wave-axis-2-trigger',
  'animation-wave-axis-content',
  'animation-wave-axis-trigger',
  'overlay-blend-preservation-mode-select',
  'overlay-color-mode-content',
  'overlay-color-mode-select',
  'overlay-crop-slider',
  'overlay-crop-switch',
  'overlay-enabled-switch',
  'overlay-finder-dither-strength-slider',
  'overlay-from-url-button',
  'overlay-gallery-button',
  'overlay-intensity-slider',
  'overlay-load-url-button',
  'overlay-blend-preservations-switch',
  'overlay-mode-content',
  'overlay-mode-select',
  'overlay-photo-button',
  'overlay-preserve-finders-switch',
  'overlay-upload',
  'render-alignment-style-select',
  'render-bg-color-picker',
  'render-bg-color-text',
  'render-corner-radius-slider',
  'render-dot-rotation-slider',
  'render-eye-inner-style-select',
  'render-eye-outer-style-select',
  'render-eye-scale-slider',
  'render-fg-color-picker',
  'render-fg-color-text',
  'render-finder-style-select',
  'render-frame-style-select',
  'render-frame-text-input',
  'render-gap-mode-select',
  'render-gradient-type-select',
  'render-module-gap-slider',
  'render-module-size-slider',
  'render-module-style-select',
  'render-timing-style-select',
  'render-transparent-bg-switch',
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

describe('Required Mapping Tranche 2: Overlay/Render/Animation explicit IDs', () => {
  it('contains non-empty, unique explicit IDs', () => {
    expect(TRANCHE_IDS.length).toBeGreaterThan(0);
    expect(new Set(TRANCHE_IDS).size).toBe(TRANCHE_IDS.length);
  });

  it('stays exactly synchronized with tests/ids.txt target sections', () => {
    expect([...TRANCHE_IDS].sort()).toEqual(parseSectionIds());
  });
});
