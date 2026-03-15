import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const read = (p: string): string => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

describe('qr-generator artistic guards', () => {
  it('keeps dithered light-dot fog disabled and grain explicitly capped', () => {
    const scaledRender = read('src/domain/render/generator/scaled-render.ts');
    const pixelGrid = read(
      'src/domain/render/generator/scaled-render-helpers/scaled-pixel-grid.ts'
    );
    const ditherDots = read(
      'src/domain/render/generator/scaled-render-helpers/compute-dither-dot-params.ts'
    );
    const forceBinary = read(
      'src/domain/render/generator/scaled-render-helpers/should-force-scaled-binary-module.ts'
    );
    const finderFlags = read(
      'src/domain/render/generator/scaled-render-helpers/is-finder-region-flag.ts'
    );

    expect(pixelGrid).toContain('const shouldDrawLightPixel =');
    expect(pixelGrid).toContain('!isDitheredMode');
    expect(pixelGrid).toContain('needsExplicitLightModules');
    expect(ditherDots).toContain('const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;');
    expect(ditherDots).toContain('(config.lightGrainDensity ?? 0.004) * qrFirstLightBoost');
    expect(ditherDots).toContain('(config.lightGrainAlpha ?? 0.05)');
    expect(scaledRender).toContain('if (isDitheredMode && overlayCanvas && useColorRendering) {');
    expect(scaledRender).toContain('const getPatternFlags = (row: number, col: number): number =>');
    expect(scaledRender).toContain('shouldForceScaledBinaryModule(getPatternFlags(row, col), pf)');
    expect(forceBinary).toContain('export function shouldForceScaledBinaryModule(');
    expect(finderFlags).toContain('export function isFinderRegionFlag(flags: number): boolean {');
    expect(forceBinary).toContain(
      'if (isFinderRegionFlag(flags)) return preserveFlags.preserveFinders;'
    );
    expect(forceBinary).toContain(
      'if ((flags & PATTERN_TIMING) !== 0) return preserveFlags.preserveTiming;'
    );
    expect(forceBinary).toContain(
      'if ((flags & PATTERN_ALIGNMENT) !== 0) return preserveFlags.preserveAlignment;'
    );
    expect(forceBinary).toContain(
      'if ((flags & PATTERN_FORMAT) !== 0) return preserveFlags.protectFormat;'
    );
    expect(forceBinary).toContain(
      'if ((flags & PATTERN_VERSION) !== 0) return preserveFlags.protectVersion;'
    );
    expect(forceBinary).toContain(
      'if ((flags & PATTERN_FIXED_DARK) !== 0) return preserveFlags.preserveFixedDark;'
    );
  });

  it('removes center-lock writeback and module-local target quotas in dither correction', () => {
    const src = read('src/domain/render/generator/enforce-module-constraints.tsx');
    expect(src).not.toContain('matrix[cy][cx]');
    expect(src).not.toContain('targetNeed');
    expect(src).toContain('totalViolationEnergy');
    expect(src).toContain('candidates.sort((a, b) => b.score - a.score)');
  });

  it('enforces final-raster decode gate with png roundtrip and single primary decoder', () => {
    const evalScenarios = read('src/modules/qr-generator/evaluate-decode-scenarios.ts');
    const imageSource = read('src/modules/qr-generator/resolve-image-source.ts');
    const qrGenerator = read('src/modules/qr-generator/qr-generator-class.ts');
    expect(imageSource).toContain("toDataURL('image/png')");
    expect(evalScenarios).toContain('if (!(await runDecode(finalRaster)))');
    expect(qrGenerator).not.toContain('decodeQRLegacy');
    expect(qrGenerator).not.toContain('decodeFromCanvas');
  });

  it('locks render policy across dither correction attempts', () => {
    const qrGenerator = read('src/modules/qr-generator/qr-generator-class.ts');
    const fixedVisualPolicy = read('src/modules/qr-generator/build-fixed-visual-policy.ts');
    expect(qrGenerator).toContain('const fixedVisualPolicy');
    expect(qrGenerator).toContain('...fixedVisualPolicy');
    expect(fixedVisualPolicy).toContain('renderScalePerModule: config.renderScalePerModule');
  });
});
