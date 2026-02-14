import fs from 'node:fs/promises';
import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import { decodeQR } from '../../src/modules/qr-decoder';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';
import {
  CANONICAL_FIXTURES,
  GALLERY_SCAN_SCENARIOS,
  type CanonicalFixtureId,
} from '../../src/data/gallery-scan-scenarios';

if (typeof globalThis.ImageData === 'undefined') {
  try {
    const sampleCtx = createCanvas(1, 1).getContext('2d');
    const nativeCtor = sampleCtx
      ? Object.getPrototypeOf(sampleCtx.getImageData(0, 0, 1, 1)).constructor
      : null;
    if (nativeCtor) {
      (globalThis as Record<string, unknown>).ImageData = nativeCtor;
    }
  } catch {
    (globalThis as Record<string, unknown>).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      colorSpace: string;
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
        } else {
          this.data = dataOrWidth;
          this.width = widthOrHeight;
          this.height = height!;
        }
        this.colorSpace = 'srgb';
      }
    };
  }
}

const nodeCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => createCanvas(width, height) as any,
};

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------

type TierId = 'tier-a' | 'tier-b';

interface TierConfig {
  id: TierId;
  label: string;
  description: string;
  scanGateProfile: 'full' | 'preview' | 'off';
  overlayIntensity: number;
  darkMinOccupancy: number;
  lightMaxOccupancy: number;
  optimizeIterations: number;
  qrBitBiasStrength: number;
}

const TIER_A: TierConfig = {
  id: 'tier-a',
  label: 'Production',
  description: 'Production-like settings with scan gate retry',
  scanGateProfile: 'preview',
  overlayIntensity: 70,
  darkMinOccupancy: 0.44,
  lightMaxOccupancy: 0.56,
  optimizeIterations: 10,
  qrBitBiasStrength: 0.06,
};

const TIER_B: TierConfig = {
  id: 'tier-b',
  label: 'Diagnostic',
  description: 'Intrinsic scannability without scan gate assistance',
  scanGateProfile: 'off',
  overlayIntensity: 65,
  darkMinOccupancy: 0.48,
  lightMaxOccupancy: 0.52,
  optimizeIterations: 12,
  qrBitBiasStrength: 0.08,
};

const ALL_TIERS: readonly TierConfig[] = [TIER_A, TIER_B];

const SUBPIXEL_DITHERED_MODES: ReadonlySet<string> = new Set(['dithered', 'blue-noise']);

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type ReasonCode =
  | 'OK'
  | 'CONTRAST_COLLAPSE'
  | 'EXPORT_LOSS'
  | 'RENDER_ERROR'
  | 'UNKNOWN';
type Disposition = 'fix-now' | 'tunable' | 'unreasonable';
type Status = 'pass' | 'fail';

interface MatrixResult {
  tier: TierId;
  scenarioId: string;
  fixtureId: CanonicalFixtureId;
  status: Status;
  reasonCode: ReasonCode;
  disposition: Disposition;
  directDecodePass: boolean;
  roundtripDecodePass: boolean;
  artifactPath: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Helpers (unchanged)
// ---------------------------------------------------------------------------

function canvasToImageData(canvas: any): ImageData {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: imageData.data, width: canvas.width, height: canvas.height } as ImageData;
}

async function loadOverlayCanvas(filePath: string, size: number): Promise<any> {
  const image = await loadImage(filePath);
  const overlay = createCanvas(size, size);
  const ctx = overlay.getContext('2d');
  ctx.drawImage(image as any, 0, 0, size, size);
  return overlay as any;
}

function makeBaseConfig(content: string, tier: TierConfig): QRGeneratorConfig {
  return {
    content,
    errorCorrection: 'H',
    typeNumber: 6,
    moduleSize: 16,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
    overlayMode: 'dithered',
    overlayIntensity: tier.overlayIntensity,
    colorMode: 'color',
    ditherKind: 'error_diffusion',
    ditherStrength: 50,
    ditherSerpentine: false,
    diffusionKernel: 'floyd_steinberg',
    renderScalePerModule: 14,
    seed: 42,
    preserveFinders: true,
    preserveTiming: true,
    preserveAlignment: true,
    protectFormatInfo: true,
    protectVersionInfo: true,
    scanGateProfile: tier.scanGateProfile,
    darkMinOccupancy: tier.darkMinOccupancy,
    lightMaxOccupancy: tier.lightMaxOccupancy,
    optimizeIterations: tier.optimizeIterations,
    qrBitBiasStrength: tier.qrBitBiasStrength,
  };
}

function classifyResult(
  directDecodePass: boolean,
  roundtripDecodePass: boolean,
  tier: TierConfig,
  overlayMode: string,
): {
  status: Status;
  reasonCode: ReasonCode;
  disposition: Disposition;
} {
  if (directDecodePass && roundtripDecodePass) {
    return { status: 'pass', reasonCode: 'OK', disposition: 'tunable' };
  }
  if (!directDecodePass) {
    const disposition: Disposition =
      tier.scanGateProfile === 'off' && SUBPIXEL_DITHERED_MODES.has(overlayMode)
        ? 'tunable'
        : 'fix-now';
    return { status: 'fail', reasonCode: 'CONTRAST_COLLAPSE', disposition };
  }
  if (!roundtripDecodePass) {
    return { status: 'fail', reasonCode: 'EXPORT_LOSS', disposition: 'fix-now' };
  }
  return { status: 'fail', reasonCode: 'UNKNOWN', disposition: 'tunable' };
}

// ---------------------------------------------------------------------------
// Tier runner
// ---------------------------------------------------------------------------

async function runTier(
  tier: TierConfig,
  overlays: Map<CanonicalFixtureId, any>,
  artifactsBaseDir: string,
): Promise<MatrixResult[]> {
  const tierDir = path.join(artifactsBaseDir, tier.id);
  await fs.mkdir(tierDir, { recursive: true });

  const results: MatrixResult[] = [];

  for (const scenario of GALLERY_SCAN_SCENARIOS) {
    for (const fixture of CANONICAL_FIXTURES) {
      const start = Date.now();
      const artifactName = `${tier.id}__${scenario.id}__${fixture.id}.png`;
      const artifactPath = path.join(tierDir, artifactName);
      try {
        const qr = new QRGenerator(nodeCanvasFactory);
        const content = `https://anqr.link/scan/${scenario.id}/${fixture.id}`;
        const cfg: QRGeneratorConfig = {
          ...makeBaseConfig(content, tier),
          ...scenario.generatorPatch,
          content,
        };
        const overlay = scenario.useOverlay ? overlays.get(fixture.id) ?? null : null;
        const generated = await qr.generate(cfg, overlay);

        const pngBuffer = (generated as any).toBuffer('image/png');
        await fs.writeFile(artifactPath, pngBuffer);

        const directDecoded = decodeQR(canvasToImageData(generated as any), {
          inversionAttempts: 'attemptBoth',
        });
        const directDecodePass = directDecoded?.data === content;

        const roundtripImage = await loadImage(pngBuffer);
        const roundtripCanvas = createCanvas((generated as any).width, (generated as any).height);
        const roundtripCtx = roundtripCanvas.getContext('2d');
        roundtripCtx.drawImage(
          roundtripImage as any,
          0,
          0,
          roundtripCanvas.width,
          roundtripCanvas.height,
        );
        const roundtripDecoded = decodeQR(canvasToImageData(roundtripCanvas as any), {
          inversionAttempts: 'attemptBoth',
        });
        const roundtripDecodePass = roundtripDecoded?.data === content;

        const overlayMode = (scenario.generatorPatch.overlayMode as string | undefined) ?? 'dithered';
        const classification = classifyResult(directDecodePass, roundtripDecodePass, tier, overlayMode);
        results.push({
          tier: tier.id,
          scenarioId: scenario.id,
          fixtureId: fixture.id,
          status: classification.status,
          reasonCode: classification.reasonCode,
          disposition: classification.disposition,
          directDecodePass,
          roundtripDecodePass,
          artifactPath: `reports/gallery-artifacts/${tier.id}/${artifactName}`,
          durationMs: Date.now() - start,
        });
      } catch {
        results.push({
          tier: tier.id,
          scenarioId: scenario.id,
          fixtureId: fixture.id,
          status: 'fail',
          reasonCode: 'RENDER_ERROR',
          disposition: 'fix-now',
          directDecodePass: false,
          roundtripDecodePass: false,
          artifactPath: `reports/gallery-artifacts/${tier.id}/${artifactName}`,
          durationMs: Date.now() - start,
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Report builders
// ---------------------------------------------------------------------------

function buildTierFixtureTable(tierResults: MatrixResult[]): string {
  const byFixture = new Map<CanonicalFixtureId, { pass: number; fail: number }>();
  for (const fixture of CANONICAL_FIXTURES) {
    byFixture.set(fixture.id, { pass: 0, fail: 0 });
  }
  for (const result of tierResults) {
    const row = byFixture.get(result.fixtureId);
    if (!row) continue;
    if (result.status === 'pass') row.pass++;
    else row.fail++;
  }
  const lines = [
    '| Fixture | Pass | Fail |',
    '| --- | ---: | ---: |',
  ];
  for (const fixture of CANONICAL_FIXTURES) {
    const row = byFixture.get(fixture.id)!;
    lines.push(`| ${fixture.id} | ${row.pass} | ${row.fail} |`);
  }
  return lines.join('\n');
}

function buildTierFailTable(tierResults: MatrixResult[]): string {
  const fails = tierResults.filter((r) => r.status === 'fail');
  if (fails.length === 0) return '_None_';
  const lines = [
    '| Scenario | Fixture | Reason | Disposition |',
    '| --- | --- | --- | --- |',
  ];
  for (const result of fails) {
    lines.push(
      `| ${result.scenarioId} | ${result.fixtureId} | ${result.reasonCode} | ${result.disposition} |`,
    );
  }
  return lines.join('\n');
}

function buildSummaryMarkdown(allResults: MatrixResult[]): string {
  const tierAResults = allResults.filter((r) => r.tier === 'tier-a');
  const tierBResults = allResults.filter((r) => r.tier === 'tier-b');
  const tierAPass = tierAResults.filter((r) => r.status === 'pass').length;
  const tierAFail = tierAResults.length - tierAPass;
  const tierBPass = tierBResults.filter((r) => r.status === 'pass').length;
  const tierBFail = tierBResults.length - tierBPass;

  const rescued: { scenarioId: string; fixtureId: CanonicalFixtureId }[] = [];
  for (const a of tierAResults) {
    if (a.status !== 'pass') continue;
    const b = tierBResults.find(
      (r) => r.scenarioId === a.scenarioId && r.fixtureId === a.fixtureId,
    );
    if (b && b.status === 'fail') {
      rescued.push({ scenarioId: a.scenarioId, fixtureId: a.fixtureId });
    }
  }

  const lines = [
    '# Gallery Scan Matrix Summary',
    '',
    '## Overview',
    '',
    `- Total runs: ${allResults.length} (${tierAResults.length} per tier × ${ALL_TIERS.length} tiers)`,
    `- **Tier A (${TIER_A.label}):** ${tierAPass} pass / ${tierAFail} fail (${Math.round((tierAPass * 100) / (tierAResults.length || 1))}%)`,
    `- **Tier B (${TIER_B.label}):** ${tierBPass} pass / ${tierBFail} fail (${Math.round((tierBPass * 100) / (tierBResults.length || 1))}%)`,
    `- Scan-gate-rescued: ${rescued.length} scenario×fixture pairs`,
    '',
    `## Tier A — ${TIER_A.label}`,
    '',
    `> ${TIER_A.description}`,
    '',
    '### By Fixture',
    '',
    buildTierFixtureTable(tierAResults),
    '',
    '### Failing Cases',
    '',
    buildTierFailTable(tierAResults),
    '',
    `## Tier B — ${TIER_B.label}`,
    '',
    `> ${TIER_B.description}`,
    '',
    '### By Fixture',
    '',
    buildTierFixtureTable(tierBResults),
    '',
    '### Failing Cases',
    '',
    buildTierFailTable(tierBResults),
    '',
    '## Comparison',
    '',
    '| Scenario | Fixture | Tier A | Tier B | Delta |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const scenario of GALLERY_SCAN_SCENARIOS) {
    for (const fixture of CANONICAL_FIXTURES) {
      const a = tierAResults.find(
        (r) => r.scenarioId === scenario.id && r.fixtureId === fixture.id,
      );
      const b = tierBResults.find(
        (r) => r.scenarioId === scenario.id && r.fixtureId === fixture.id,
      );
      const aStatus = a?.status ?? '—';
      const bStatus = b?.status ?? '—';
      let delta = '';
      if (aStatus === 'pass' && bStatus === 'fail') delta = '🟢 rescued';
      else if (aStatus === 'fail' && bStatus === 'pass') delta = '🔴 regression';
      else if (aStatus === 'pass' && bStatus === 'pass') delta = '✅ both pass';
      else if (aStatus === 'fail' && bStatus === 'fail') delta = '❌ both fail';
      lines.push(
        `| ${scenario.id} | ${fixture.id} | ${aStatus} | ${bStatus} | ${delta} |`,
      );
    }
  }

  lines.push('');
  lines.push('## Scan-Gate-Rescued');
  lines.push('');
  lines.push('Scenarios that pass in Tier A but fail in Tier B — the scan gate made the difference:');
  lines.push('');
  if (rescued.length === 0) {
    lines.push('_None — all Tier A passes also pass in Tier B._');
  } else {
    lines.push('| Scenario | Fixture |');
    lines.push('| --- | --- |');
    for (const r of rescued) {
      lines.push(`| ${r.scenarioId} | ${r.fixtureId} |`);
    }
  }

  return `${lines.join('\n')}\n`;
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

describe('gallery scan matrix', () => {
  it(
    'runs canonical scenarios across all four fixtures in both tiers and writes matrix reports',
    async () => {
      const reportsDir = path.join(process.cwd(), 'reports');
      const artifactsDir = path.join(reportsDir, 'gallery-artifacts');
      await fs.rm(artifactsDir, { recursive: true, force: true });
      await fs.mkdir(artifactsDir, { recursive: true });

      const overlays = new Map<CanonicalFixtureId, any>();
      for (const fixture of CANONICAL_FIXTURES) {
        const overlay = await loadOverlayCanvas(path.join(process.cwd(), fixture.filePath), 240);
        overlays.set(fixture.id, overlay);
      }

      const tierAResults = await runTier(TIER_A, overlays, artifactsDir);
      const tierBResults = await runTier(TIER_B, overlays, artifactsDir);
      const allResults = [...tierAResults, ...tierBResults];

      const byScenario = new Map<string, MatrixResult[]>();
      for (const result of tierAResults) {
        const arr = byScenario.get(result.scenarioId) ?? [];
        arr.push(result);
        byScenario.set(result.scenarioId, arr);
      }

      const galleryCandidates = Array.from(byScenario.entries())
        .map(([scenarioId, runs]) => {
          const passRuns = runs.filter((r) => r.status === 'pass');
          if (passRuns.length === 0) return null;
          passRuns.sort((a, b) => a.durationMs - b.durationMs);
          return {
            scenarioId,
            selectedFixtureId: passRuns[0].fixtureId,
            artifactPath: passRuns[0].artifactPath,
            status: passRuns[0].status,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const tierAPass = tierAResults.filter((r) => r.status === 'pass').length;
      const tierBPass = tierBResults.filter((r) => r.status === 'pass').length;

      const matrix = {
        generatedAt: new Date().toISOString(),
        tiers: ALL_TIERS.map((t) => ({
          id: t.id,
          label: t.label,
          description: t.description,
          scanGateProfile: t.scanGateProfile,
          overlayIntensity: t.overlayIntensity,
          darkMinOccupancy: t.darkMinOccupancy,
          lightMaxOccupancy: t.lightMaxOccupancy,
          optimizeIterations: t.optimizeIterations,
          qrBitBiasStrength: t.qrBitBiasStrength,
        })),
        scenarios: GALLERY_SCAN_SCENARIOS.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          featureGroup: s.featureGroup,
          heroPriority: s.heroPriority,
          galleryEligible: s.galleryEligible,
        })),
        fixtures: CANONICAL_FIXTURES.map((f) => ({
          id: f.id,
          filePath: f.filePath,
          publicPath: f.publicPath,
          isAnimated: f.isAnimated,
        })),
        totalRuns: allResults.length,
        tierA: {
          totalRuns: tierAResults.length,
          passRuns: tierAPass,
          failRuns: tierAResults.length - tierAPass,
        },
        tierB: {
          totalRuns: tierBResults.length,
          passRuns: tierBPass,
          failRuns: tierBResults.length - tierBPass,
        },
        results: allResults,
        galleryCandidates,
      };

      await fs.writeFile(
        path.join(reportsDir, 'gallery-scan-matrix.json'),
        JSON.stringify(matrix, null, 2),
      );
      await fs.writeFile(
        path.join(reportsDir, 'gallery-scan-summary.md'),
        buildSummaryMarkdown(allResults),
      );

      const runsPerTier = GALLERY_SCAN_SCENARIOS.length * CANONICAL_FIXTURES.length;
      expect(allResults.length).toBe(runsPerTier * ALL_TIERS.length);
      expect(tierAPass).toBeGreaterThan(0);
      expect(galleryCandidates.length).toBeGreaterThan(0);
    },
    600000,
  );
});
