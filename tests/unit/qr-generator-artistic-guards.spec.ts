import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const read = (p: string): string => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('qr-generator artistic guards', () => {
  it('keeps dithered light-dot fog disabled and grain explicitly capped', () => {
    const src = read('src/modules/qr-generator/scaled-render.ts');
    expect(src).toContain('const shouldDrawLightPixel =');
    expect(src).toContain('!isDitheredMode');
    expect(src).toContain('needsExplicitLightModules');
    expect(src).toContain('const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;');
    expect(src).toContain('(config.lightGrainDensity ?? 0.004) * qrFirstLightBoost');
    expect(src).toContain('(config.lightGrainAlpha ?? 0.05)');
    expect(src).toContain('if (isDitheredMode) {');
    expect(src).toContain('const grainChance = Math.max(');
    expect(src).toContain(
      'const shouldForceBinaryModule = (row: number, col: number): boolean => {'
    );
    expect(src).toContain(
      'if (isFinderPatternSpec(row, col, moduleCount) || isFinderSeparator(row, col)) {'
    );
    expect(src).toContain('return preserveFinders;');
    expect(src).toContain('if (isTimingPatternSpec(row, col, moduleCount)) return preserveTiming;');
    expect(src).toContain(
      'if (isAlignmentPatternSpec(row, col, moduleCount, version)) return preserveAlignment;'
    );
    expect(src).toContain('if (isFormatInfoSpec(row, col, moduleCount)) return protectFormat;');
    expect(src).toContain(
      'if (isVersionInfoSpec(row, col, moduleCount, version)) return protectVersion;'
    );
    expect(src).toContain('const preserveFixedDark =');
    expect(src).toContain('if (row === moduleCount - 8 && col === 8) return preserveFixedDark;');
  });

  it('removes center-lock writeback and module-local target quotas in dither correction', () => {
    const src = read('src/modules/qr-generator/pixel-matrix-dithered.ts');
    expect(src).not.toContain('matrix[cy][cx]');
    expect(src).not.toContain('targetNeed');
    expect(src).toContain('totalViolationEnergy');
    expect(src).toContain('candidates.sort((a, b) => b.score - a.score)');
  });

  it('enforces final-raster decode gate with png roundtrip and single primary decoder', () => {
    const src = read('src/modules/qr-generator/qr-generator-class.ts');
    expect(src).toContain("toDataURL('image/png')");
    expect(src).toContain('if (!runDecode(finalRaster))');
    expect(src).not.toContain('decodeQRLegacy');
    expect(src).not.toContain('decodeFromCanvas');
  });

  it('locks render policy across dither correction attempts', () => {
    const src = read('src/modules/qr-generator/qr-generator-class.ts');
    expect(src).toContain('const fixedVisualPolicy');
    expect(src).toContain('...fixedVisualPolicy');
    expect(src).toContain('renderScalePerModule: effectiveConfig.renderScalePerModule');
  });
});
