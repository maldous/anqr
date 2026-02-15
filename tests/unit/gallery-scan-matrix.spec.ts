import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createGifEncoder, decodeGif, quantizeGifPalette, indexGifPixels } from '../../src/modules/animation/gif-codec';
import { getLogLevel, setLogLevel, type LogLevel } from '../../src/lib/logger';
import { decodeQR } from '../../src/modules/qr-decoder';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';
import {
  CANONICAL_FIXTURES,
  GALLERY_SCAN_SCENARIOS,
  type CanonicalFixtureId,
  type ScenarioFeatureGroup,
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

const MAX_ANIMATED_FRAMES = 8;

const FEATURE_COVERAGE_REQUIREMENTS: Record<ScenarioFeatureGroup, number> = {
  overlay: 6,
  preservation: 2,
  render: 3,
  encoding: 3,
  animation: 3,
  output: 2,
  watermark: 2,
};

function parseCsvFilter(raw: string | undefined): Set<string> | null {
  if (!raw) return null;
  const values = raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  return values.length > 0 ? new Set(values) : null;
}

function parseBooleanEnv(raw: string | undefined, fallback: boolean): boolean {
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on')
    return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off')
    return false;
  return fallback;
}

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
  isAnimated: boolean;
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

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function loadGifOverlayFrames(
  filePath: string,
  size: number,
  maxFrames: number,
): { canvases: any[]; delays: number[] } {
  const gif = decodeGif(toArrayBuffer(readFileSync(filePath)));
  const composite = createCanvas(gif.width, gif.height);
  const compositeCtx = composite.getContext('2d');
  const canvases: any[] = [];
  const delays: number[] = [];
  const frameCount = Math.min(maxFrames, gif.frames.length);

  for (let i = 0; i < frameCount; i++) {
    const frame = gif.frames[i] as {
      dims: { left: number; top: number; width: number; height: number };
      patch: Uint8Array;
      disposalType: number;
      delay: number;
    };
    const { left, top, width, height } = frame.dims;
    const restore =
      frame.disposalType === 3 ? compositeCtx.getImageData(left, top, width, height) : null;

    const patchCanvas = createCanvas(width, height);
    const patchCtx = patchCanvas.getContext('2d');
    patchCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), width, height), 0, 0);
    compositeCtx.drawImage(patchCanvas as any, left, top);

    const overlay = createCanvas(size, size);
    const overlayCtx = overlay.getContext('2d');
    overlayCtx.imageSmoothingEnabled = true;
    overlayCtx.imageSmoothingQuality = 'high';
    overlayCtx.drawImage(composite as any, 0, 0, size, size);
    canvases.push(overlay as any);
    delays.push(Math.max(frame.delay, 20));

    if (frame.disposalType === 2) {
      compositeCtx.clearRect(left, top, width, height);
    } else if (frame.disposalType === 3 && restore) {
      compositeCtx.putImageData(restore, left, top);
    }
  }

  return { canvases, delays };
}

function canvasesToAnimatedGifBuffer(canvases: any[], delays: number[]): Buffer {
  const gif = createGifEncoder();
  for (let i = 0; i < canvases.length; i++) {
    const ctx = canvases[i].getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvases[i].width, canvases[i].height);
    const palette = quantizeGifPalette(imageData.data, 256);
    const index = indexGifPixels(imageData.data, palette);
    const opts: Record<string, unknown> = { palette, delay: delays[i] ?? 100, dispose: 2 };
    if (i === 0) opts.repeat = 0;
    gif.writeFrame(index, canvases[i].width, canvases[i].height, opts);
  }
  gif.finish();
  return Buffer.from(gif.bytes());
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
  scenarios: readonly (typeof GALLERY_SCAN_SCENARIOS)[number][],
  fixtures: readonly (typeof CANONICAL_FIXTURES)[number][],
  overlays: Map<CanonicalFixtureId, any>,
  animatedOverlays: Map<CanonicalFixtureId, { canvases: any[]; delays: number[] }>,
  artifactsBaseDir: string,
): Promise<MatrixResult[]> {
  const tierDir = path.join(artifactsBaseDir, tier.id);
  await fs.mkdir(tierDir, { recursive: true });

  const requestedParallel = Number.parseInt(process.env.SCAN_MATRIX_MAX_PARALLEL ?? '', 10);
  const maxParallel = Number.isFinite(requestedParallel) && requestedParallel > 0
    ? requestedParallel
    : Math.max(1, Math.min(os.cpus().length, 16));

  const jobs: { scenario: (typeof GALLERY_SCAN_SCENARIOS)[number]; fixture: (typeof CANONICAL_FIXTURES)[number] }[] = [];
  for (const scenario of scenarios) {
    for (const fixture of fixtures) {
      jobs.push({ scenario, fixture });
    }
  }

  const results = new Array<MatrixResult>(jobs.length);
  let nextJob = 0;
  const workerCount = Math.max(1, Math.min(maxParallel, jobs.length));
  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const jobIndex = nextJob++;
      if (jobIndex >= jobs.length) break;
      const { scenario, fixture } = jobs[jobIndex];
      const start = Date.now();
      const ext = fixture.isAnimated ? 'gif' : 'png';
      const artifactName = `${tier.id}__${scenario.id}__${fixture.id}.${ext}`;
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
        const animFrames = fixture.isAnimated && scenario.useOverlay
          ? animatedOverlays.get(fixture.id)
          : undefined;

        let generated: any;
        let imageBuffer: Buffer;

        if (animFrames && animFrames.canvases.length > 1) {
          const qrFrames: any[] = [];
          for (let i = 0; i < animFrames.canvases.length; i++) {
            const frame = await qr.generate(cfg, animFrames.canvases[i]);
            qrFrames.push(frame);
          }
          generated = qrFrames[0];
          imageBuffer = canvasesToAnimatedGifBuffer(qrFrames, animFrames.delays);
        } else if (fixture.isAnimated) {
          generated = await qr.generate(cfg, overlay);
          imageBuffer = canvasesToAnimatedGifBuffer([generated], [100]);
        } else {
          generated = await qr.generate(cfg, overlay);
          imageBuffer = (generated as any).toBuffer('image/png');
        }
        await fs.writeFile(artifactPath, imageBuffer);

        const directDecoded = decodeQR(canvasToImageData(generated as any), {
          inversionAttempts: 'attemptBoth',
        });
        const directDecodePass = directDecoded?.data === content;

        const roundtripImage = await loadImage(imageBuffer);
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
        results[jobIndex] = {
          tier: tier.id,
          scenarioId: scenario.id,
          fixtureId: fixture.id,
          isAnimated: fixture.isAnimated,
          status: classification.status,
          reasonCode: classification.reasonCode,
          disposition: classification.disposition,
          directDecodePass,
          roundtripDecodePass,
          artifactPath: `reports/gallery-artifacts/${tier.id}/${artifactName}`,
          durationMs: Date.now() - start,
        };
      } catch {
        results[jobIndex] = {
          tier: tier.id,
          scenarioId: scenario.id,
          fixtureId: fixture.id,
          isAnimated: fixture.isAnimated,
          status: 'fail',
          reasonCode: 'RENDER_ERROR',
          disposition: 'fix-now',
          directDecodePass: false,
          roundtripDecodePass: false,
          artifactPath: `reports/gallery-artifacts/${tier.id}/${artifactName}`,
          durationMs: Date.now() - start,
        };
      }
    }
  });

  await Promise.all(workers);

  return results;
}

// ---------------------------------------------------------------------------
// Report builders
// ---------------------------------------------------------------------------

function buildTierFixtureTable(
  tierResults: MatrixResult[],
  fixtures: readonly (typeof CANONICAL_FIXTURES)[number][]
): string {
  const byFixture = new Map<CanonicalFixtureId, { pass: number; fail: number }>();
  for (const fixture of fixtures) {
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
  for (const fixture of fixtures) {
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

function buildSummaryMarkdown(
  allResults: MatrixResult[],
  scenarios: readonly (typeof GALLERY_SCAN_SCENARIOS)[number][],
  fixtures: readonly (typeof CANONICAL_FIXTURES)[number][]
): string {
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
    buildTierFixtureTable(tierAResults, fixtures),
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
    buildTierFixtureTable(tierBResults, fixtures),
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

  for (const scenario of scenarios) {
    for (const fixture of fixtures) {
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
  let previousLogLevel: LogLevel;

  beforeAll(() => {
    previousLogLevel = getLogLevel();
    setLogLevel('error');
  });

  afterAll(() => {
    setLogLevel(previousLogLevel);
  });

  it(
    'runs canonical scenarios across all four fixtures in both tiers and writes matrix reports',
    async () => {
      const scenarioFilter = parseCsvFilter(process.env.SCAN_MATRIX_SCENARIOS);
      const fixtureFilter = parseCsvFilter(process.env.SCAN_MATRIX_FIXTURES);
      const scenarios = scenarioFilter
        ? GALLERY_SCAN_SCENARIOS.filter((s) => scenarioFilter.has(s.id))
        : GALLERY_SCAN_SCENARIOS;
      const fixtures = fixtureFilter
        ? CANONICAL_FIXTURES.filter((f) => fixtureFilter.has(f.id))
        : CANONICAL_FIXTURES;

      if (scenarios.length === 0) {
        throw new Error(
          `SCAN_MATRIX_SCENARIOS produced zero matches: ${process.env.SCAN_MATRIX_SCENARIOS ?? ''}`
        );
      }
      if (fixtures.length === 0) {
        throw new Error(
          `SCAN_MATRIX_FIXTURES produced zero matches: ${process.env.SCAN_MATRIX_FIXTURES ?? ''}`
        );
      }

      const reportsDir = path.join(process.cwd(), 'reports');
      const artifactsDir = path.join(reportsDir, 'gallery-artifacts');
      const outputSuffix = (process.env.SCAN_MATRIX_OUTPUT_SUFFIX ?? '').trim();
      const cleanArtifacts = parseBooleanEnv(process.env.SCAN_MATRIX_CLEAN_ARTIFACTS, true);
      const matrixReportName = outputSuffix
        ? `gallery-scan-matrix.${outputSuffix}.json`
        : 'gallery-scan-matrix.json';
      const summaryReportName = outputSuffix
        ? `gallery-scan-summary.${outputSuffix}.md`
        : 'gallery-scan-summary.md';

      if (cleanArtifacts) {
        await fs.rm(artifactsDir, { recursive: true, force: true });
      }
      await fs.mkdir(artifactsDir, { recursive: true });

      const overlays = new Map<CanonicalFixtureId, any>();
      const animatedOverlays = new Map<CanonicalFixtureId, { canvases: any[]; delays: number[] }>();
      for (const fixture of fixtures) {
        const overlay = await loadOverlayCanvas(path.join(process.cwd(), fixture.filePath), 240);
        overlays.set(fixture.id, overlay);
        if (fixture.isAnimated) {
          animatedOverlays.set(
            fixture.id,
            loadGifOverlayFrames(
              path.join(process.cwd(), fixture.filePath),
              240,
              MAX_ANIMATED_FRAMES,
            ),
          );
        }
      }

      const tierAResults = await runTier(TIER_A, scenarios, fixtures, overlays, animatedOverlays, artifactsDir);
      const tierBResults = await runTier(TIER_B, scenarios, fixtures, overlays, animatedOverlays, artifactsDir);
      const allResults = [...tierAResults, ...tierBResults];

      const byScenario = new Map<string, MatrixResult[]>();
      for (const result of tierAResults) {
        const arr = byScenario.get(result.scenarioId) ?? [];
        arr.push(result);
        byScenario.set(result.scenarioId, arr);
      }

      const scenarioMeta = new Map(
        scenarios.map((s) => [s.id, s]),
      );

      const galleryCandidates = Array.from(byScenario.entries())
        .map(([scenarioId, runs]) => {
          const passRuns = runs.filter((r) => r.status === 'pass');
          if (passRuns.length === 0) return null;
          passRuns.sort((a, b) => a.durationMs - b.durationMs);
          const meta = scenarioMeta.get(scenarioId);
          return {
            scenarioId,
            selectedFixtureId: passRuns[0].fixtureId,
            isAnimated: passRuns[0].isAnimated,
            heroPriority: meta?.heroPriority ?? 0,
            galleryEligible: meta?.galleryEligible ?? false,
            artifactPath: passRuns[0].artifactPath,
            status: passRuns[0].status,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.heroPriority - a.heroPriority);

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
        scenarios: scenarios.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          featureGroup: s.featureGroup,
          heroPriority: s.heroPriority,
          galleryEligible: s.galleryEligible,
        })),
        fixtures: fixtures.map((f) => ({
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
        path.join(reportsDir, matrixReportName),
        JSON.stringify(matrix, null, 2),
      );
      await fs.writeFile(
        path.join(reportsDir, summaryReportName),
        buildSummaryMarkdown(allResults, scenarios, fixtures),
      );

      const runsPerTier = scenarios.length * fixtures.length;
      expect(allResults.length).toBe(runsPerTier * ALL_TIERS.length);
      expect(tierAPass).toBeGreaterThan(0);
      expect(galleryCandidates.length).toBeGreaterThan(0);

      if (!scenarioFilter) {
        const groupCounts = new Map<string, number>();
        for (const s of scenarios) {
          groupCounts.set(s.featureGroup, (groupCounts.get(s.featureGroup) ?? 0) + 1);
        }
        const coverageGaps: string[] = [];
        for (const [group, minCount] of Object.entries(FEATURE_COVERAGE_REQUIREMENTS)) {
          const actual = groupCounts.get(group) ?? 0;
          if (actual < minCount) {
            coverageGaps.push(`${group}: ${actual}/${minCount}`);
          }
        }
        expect(coverageGaps, `Feature coverage gaps: ${coverageGaps.join(', ')}`).toHaveLength(0);
      }
    },
    900000,
  );
});
