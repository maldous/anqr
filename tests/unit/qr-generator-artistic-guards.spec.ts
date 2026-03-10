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
    expect(src).toContain('const shouldForceBinaryModule = (row: number, col: number): boolean =>');
    expect(src).toContain('shouldForceScaledBinaryModule(getPatternFlags(row, col), pf)');
    expect(src).toContain('const getPatternFlags = (row: number, col: number): number =>');
    expect(src).toContain('function isFinderRegionFlag(flags: number): boolean {');
    expect(src).toContain('function shouldForceScaledBinaryModule(');
    expect(src).toContain('if (isFinderRegionFlag(flags)) return pf.preserveFinders;');
    expect(src).toContain('if ((flags & PATTERN_TIMING) !== 0) return pf.preserveTiming;');
    expect(src).toContain('if ((flags & PATTERN_ALIGNMENT) !== 0) return pf.preserveAlignment;');
    expect(src).toContain('if ((flags & PATTERN_FORMAT) !== 0) return pf.protectFormat;');
    expect(src).toContain('if ((flags & PATTERN_VERSION) !== 0) return pf.protectVersion;');
    expect(src).toContain('preserveFixedDark:');
    expect(src).toContain('if ((flags & PATTERN_FIXED_DARK) !== 0) return pf.preserveFixedDark;');
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
    expect(src).toContain('if (!(await runDecode(finalRaster)))');
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
