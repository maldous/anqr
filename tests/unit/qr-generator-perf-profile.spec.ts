/**
 * QR Generator Performance Profiling
 *
 * Measures the actual impact of all performance optimizations:
 *  1. Fast-path batch fillRect with run-length encoding (simple square modules)
 *  2. Uint8Array skip mask (replacing Set<string>)
 *  3. Precomputed functional-pattern map (replacing per-cell function calls)
 *  4. Hoisted loop-invariant constants
 *  5. Eliminated per-module ctx.save()/restore()
 *  6. Functional map cache (same moduleCount+version across frames)
 *  7. Fast-preview mode (skipping gradient/halftone/jitter/palette)
 *
 * Run with: npx vitest run tests/unit/qr-generator-perf-profile.spec.ts
 */

import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it } from 'vitest';
import {
  QRGenerator,
  clearFunctionalMapCache,
  clearQRCaches,
  type CanvasFactory,
  type QRGeneratorConfig,
} from '../../src/modules/qr-generator';

// Polyfill ImageData for Node.js
if (typeof globalThis.ImageData === 'undefined') {
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

const nodeCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => createCanvas(width, height) as never,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BenchResult {
  label: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  opsPerSec: number;
}

async function benchAsync(
  label: string,
  fn: () => Promise<void>,
  iterations: number
): Promise<BenchResult> {
  // Warmup
  await fn();
  await fn();

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }

  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  const opsPerSec = 1000 / avgMs;

  return { label, iterations, totalMs, avgMs, minMs, maxMs, opsPerSec };
}

function formatResult(r: BenchResult): string {
  return (
    `  ${r.label.padEnd(45)} ` +
    `avg=${r.avgMs.toFixed(2).padStart(7)}ms  ` +
    `min=${r.minMs.toFixed(2).padStart(7)}ms  ` +
    `max=${r.maxMs.toFixed(2).padStart(7)}ms  ` +
    `ops/s=${r.opsPerSec.toFixed(1).padStart(8)}`
  );
}

function printResults(title: string, results: BenchResult[]): void {
  const lines = [`\n${'='.repeat(100)}`, `  ${title}`, `${'='.repeat(100)}`];
  for (const r of results) lines.push(formatResult(r));
  lines.push('='.repeat(100));
  // biome-ignore lint/suspicious/noConsole: benchmark output
  console.log(lines.join('\n'));
}

// ---------------------------------------------------------------------------
// Base configs
// ---------------------------------------------------------------------------

const BASE_CONFIG: QRGeneratorConfig = {
  content: 'https://example.com/perf-benchmark-test',
  errorCorrection: 'M',
  typeNumber: 0,
  moduleSize: 8,
  margin: 4,
  fgColor: '#000000',
  bgColor: '#ffffff',
};

const ITERATIONS = 20;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('qr-generator performance profile', () => {
  it('profiles end-to-end generate() across rendering scenarios', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    // 1. Fast path: simple square, no overlay, no gap, no palette
    results.push(
      await benchAsync(
        'Fast path (square, no overlay)',
        async () => {
          await qr.generate({ ...BASE_CONFIG }, null);
        },
        ITERATIONS
      )
    );

    // 2. Full path: rounded modules (disables fast path)
    results.push(
      await benchAsync(
        'Full path (rounded modules)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 50 }, null);
        },
        ITERATIONS
      )
    );

    // 3. Full path: dots modules
    results.push(
      await benchAsync(
        'Full path (dots modules)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'dots' }, null);
        },
        ITERATIONS
      )
    );

    // 4. Full path: diamond modules
    results.push(
      await benchAsync(
        'Full path (diamond modules)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'diamond' }, null);
        },
        ITERATIONS
      )
    );

    // 5. Full path with module gap (disables fast path)
    results.push(
      await benchAsync(
        'Full path (square + gap)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleGap: 15, gapMode: 'inset' }, null);
        },
        ITERATIONS
      )
    );

    // 6. Full path with gradient
    results.push(
      await benchAsync(
        'Full path (gradient)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              moduleStyle: 'rounded',
              cornerRadius: 30,
              gradient: {
                type: 'linear',
                angle: 45,
                stops: [
                  { pos: 0, color: '#ff0000' },
                  { pos: 1, color: '#0000ff' },
                ],
              },
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // 7. Full path with palette (disables fast path, adds per-module color)
    results.push(
      await benchAsync(
        'Full path (palette)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              moduleStyle: 'rounded',
              cornerRadius: 30,
              palette: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],

              paletteMode: 'brightness',
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // 8. Full path with rotation (tests save/restore skip optimisation)
    results.push(
      await benchAsync(
        'Full path (dots + rotation)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'dots', dotRotationDeg: 45 }, null);
        },
        ITERATIONS
      )
    );

    // 9. Fast preview mode (strips expensive features)
    results.push(
      await benchAsync(
        'Fast preview (square, fastPreview=true)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              fastPreview: true,
              gradient: {
                type: 'linear',
                angle: 45,
                stops: [
                  { pos: 0, color: '#ff0000' },
                  { pos: 1, color: '#0000ff' },
                ],
              },
              palette: ['#ff0000', '#00ff00', '#0000ff'],
              moduleJitterPx: 2,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // 10. Fast preview with styled modules (fast path relaxed checks)
    results.push(
      await benchAsync(
        'Fast preview (square + jitter stripped)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              fastPreview: true,
              moduleJitterPx: 3,
              contrastGuard: true,
              minContrastRatio: 4.5,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // 11. Larger QR (version ~10, more modules = bigger render loop)
    results.push(
      await benchAsync(
        'Fast path (large QR, v10)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              content:
                'https://example.com/this-is-a-much-longer-url-to-force-a-higher-qr-version-and-more-modules-in-the-render-loop-for-benchmarking-purposes',
              moduleSize: 4,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // 12. Larger QR full path (rounded, to compare)
    results.push(
      await benchAsync(
        'Full path (large QR, v10, rounded)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              content:
                'https://example.com/this-is-a-much-longer-url-to-force-a-higher-qr-version-and-more-modules-in-the-render-loop-for-benchmarking-purposes',
              moduleSize: 4,
              moduleStyle: 'rounded',
              cornerRadius: 40,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    printResults('END-TO-END generate() PROFILE', results);

    // Sanity: all results should have positive timing
    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
      expect(r.opsPerSec).toBeGreaterThan(0);
    }
  }, 120_000);

  it('profiles functional map cache hit vs miss', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    // Cold: clear caches before each iteration
    results.push(
      await benchAsync(
        'Functional map (cache MISS each iter)',
        async () => {
          clearFunctionalMapCache();
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 30 }, null);
        },
        ITERATIONS
      )
    );

    // Warm: same config = cache hit for functional map
    results.push(
      await benchAsync(
        'Functional map (cache HIT each iter)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 30 }, null);
        },
        ITERATIONS
      )
    );

    printResults('FUNCTIONAL MAP CACHE PROFILE', results);

    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 60_000);

  it('profiles animation simulation (repeated frames, same config)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];
    const frameCount = 30;

    // Simulate animation: same base config, only frameIndex changes
    // This exercises the functional map cache and QR matrix cache
    results.push(
      await benchAsync(
        `Animation ${frameCount} frames (fast path)`,
        async () => {
          for (let f = 0; f < frameCount; f++) {
            await qr.generate({ ...BASE_CONFIG, frameIndex: f }, null);
          }
        },
        5
      )
    );

    results.push(
      await benchAsync(
        `Animation ${frameCount} frames (rounded)`,
        async () => {
          for (let f = 0; f < frameCount; f++) {
            await qr.generate(
              { ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 40, frameIndex: f },
              null
            );
          }
        },
        5
      )
    );

    results.push(
      await benchAsync(
        `Animation ${frameCount} frames (fast preview)`,
        async () => {
          for (let f = 0; f < frameCount; f++) {
            await qr.generate(
              {
                ...BASE_CONFIG,
                fastPreview: true,
                moduleStyle: 'rounded',
                cornerRadius: 40,
                gradient: {
                  type: 'linear',
                  angle: 45,
                  stops: [
                    { pos: 0, color: '#ff0000' },
                    { pos: 1, color: '#0000ff' },
                  ],
                },
                frameIndex: f,
              },
              null
            );
          }
        },
        5
      )
    );

    // Report per-frame timing
    const perFrame = results.map((r) => ({
      ...r,
      label: `${r.label} (per frame)`,
      avgMs: r.avgMs / frameCount,
      minMs: r.minMs / frameCount,
      maxMs: r.maxMs / frameCount,
      opsPerSec: r.opsPerSec * frameCount,
    }));

    printResults('ANIMATION SIMULATION (total)', results);
    printResults('ANIMATION SIMULATION (per frame)', perFrame);

    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 120_000);

  it('profiles overlay render paths', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    // Create a test overlay canvas
    const overlay = createCanvas(256, 256);
    const octx = overlay.getContext('2d');
    const grad = octx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#888888');
    grad.addColorStop(1, '#000000');
    octx.fillStyle = grad;
    octx.fillRect(0, 0, 256, 256);

    // Halftone overlay (non-scaled path)
    results.push(
      await benchAsync(
        'Overlay: halftone',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              errorCorrection: 'H',
              overlayMode: 'halftone',
              overlayIntensity: 70,
              colorMode: 'color',
            },
            overlay as never
          );
        },
        ITERATIONS
      )
    );

    // Blend overlay (non-scaled path)
    results.push(
      await benchAsync(
        'Overlay: blend',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              errorCorrection: 'H',
              overlayMode: 'blend',
              overlayIntensity: 60,
              colorMode: 'color',
            },
            overlay as never
          );
        },
        ITERATIONS
      )
    );

    // Dithered overlay (scaled path, scan gate off for speed)
    results.push(
      await benchAsync(
        'Overlay: dithered (scan gate off)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              errorCorrection: 'H',
              overlayMode: 'dithered',
              overlayIntensity: 60,
              colorMode: 'color',
              scanGateProfile: 'off',
            },
            overlay as never
          );
        },
        ITERATIONS
      )
    );

    // Dithered with fast preview (skips scan gate + overlay preprocessing)
    results.push(
      await benchAsync(
        'Overlay: dithered (fast preview)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              errorCorrection: 'H',
              overlayMode: 'dithered',
              overlayIntensity: 60,
              colorMode: 'color',
              fastPreview: true,
            },
            overlay as never
          );
        },
        ITERATIONS
      )
    );

    // Center logo mode (draws logo on top, no per-module overlay)
    results.push(
      await benchAsync(
        'Overlay: center logo',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              errorCorrection: 'H',
              overlayMode: 'center',
              logoSize: 30,
            },
            overlay as never
          );
        },
        ITERATIONS
      )
    );

    printResults('OVERLAY RENDER PATHS PROFILE', results);

    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 120_000);

  it('profiles cache clearing overhead', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    // Warm all caches
    await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 30 }, null);

    // Measure with all caches warm (no clearing)
    results.push(
      await benchAsync(
        'Render with warm caches',
        async () => {
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 30 }, null);
        },
        ITERATIONS
      )
    );

    // Measure with all caches cleared each time
    results.push(
      await benchAsync(
        'Render with cold caches (cleared each iter)',
        async () => {
          clearQRCaches();
          await qr.generate({ ...BASE_CONFIG, moduleStyle: 'rounded', cornerRadius: 30 }, null);
        },
        ITERATIONS
      )
    );

    printResults('CACHE OVERHEAD PROFILE', results);

    // Cache warm should be faster or equal
    const warmAvg = results[0].avgMs;
    const coldAvg = results[1].avgMs;
    // biome-ignore lint/suspicious/noConsole: benchmark output
    console.log(
      `\n  Cache speedup: ${((coldAvg / warmAvg - 1) * 100).toFixed(1)}% faster with warm caches\n`
    );

    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 60_000);

  it('profiles fast-preview vs full-quality speedup', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    const richConfig: QRGeneratorConfig = {
      ...BASE_CONFIG,
      moduleStyle: 'rounded',
      cornerRadius: 40,
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { pos: 0, color: '#e91e63' },
          { pos: 0.5, color: '#9c27b0' },
          { pos: 1, color: '#2196f3' },
        ],
      },
      palette: ['#e91e63', '#ff5722', '#ff9800', '#4caf50', '#2196f3'],
      paletteMode: 'brightness',
      moduleJitterPx: 1.5,
      contrastGuard: true,
      minContrastRatio: 3.0,
    };

    // Full quality
    results.push(
      await benchAsync(
        'Full quality (gradient+palette+jitter+contrast)',
        async () => {
          await qr.generate(richConfig, null);
        },
        ITERATIONS
      )
    );

    // Fast preview of the same config
    results.push(
      await benchAsync(
        'Fast preview of same config',
        async () => {
          await qr.generate({ ...richConfig, fastPreview: true }, null);
        },
        ITERATIONS
      )
    );

    printResults('FAST-PREVIEW vs FULL-QUALITY', results);

    const fullAvg = results[0].avgMs;
    const previewAvg = results[1].avgMs;
    const speedup = fullAvg / previewAvg;
    // biome-ignore lint/suspicious/noConsole: benchmark output
    console.log(
      `\n  Fast preview speedup: ${speedup.toFixed(2)}x faster (${fullAvg.toFixed(2)}ms → ${previewAvg.toFixed(2)}ms)\n`
    );

    for (const r of results) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 60_000);

  it('profiles QR version scaling (module count impact on render loop)', async () => {
    const qr = new QRGenerator(nodeCanvasFactory);
    const results: BenchResult[] = [];

    // Version 1: 21×21 = 441 modules
    results.push(
      await benchAsync(
        'V1 (21×21 = 441 modules)',
        async () => {
          await qr.generate(
            { ...BASE_CONFIG, content: '123', typeNumber: 1, moduleSize: 10 },
            null
          );
        },
        ITERATIONS
      )
    );

    // Version 5: 37×37 = 1369 modules
    results.push(
      await benchAsync(
        'V5 (37×37 = 1369 modules)',
        async () => {
          await qr.generate({ ...BASE_CONFIG, typeNumber: 5, moduleSize: 6 }, null);
        },
        ITERATIONS
      )
    );

    // Version 10: 57×57 = 3249 modules
    results.push(
      await benchAsync(
        'V10 (57×57 = 3249 modules)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              content:
                'https://example.com/a-longer-payload-string-to-force-version-ten-or-higher-in-the-qr-code-benchmarks',
              typeNumber: 10,
              moduleSize: 4,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    // Version 20: 97×97 = 9409 modules
    results.push(
      await benchAsync(
        'V20 (97×97 = 9409 modules)',
        async () => {
          const longContent = 'X'.repeat(500);
          await qr.generate(
            {
              ...BASE_CONFIG,
              content: longContent,
              typeNumber: 20,
              moduleSize: 3,
              errorCorrection: 'L',
            },
            null
          );
        },
        ITERATIONS
      )
    );

    printResults('QR VERSION SCALING (fast path)', results);

    // Same versions but with rounded modules (full path)
    const fullResults: BenchResult[] = [];

    fullResults.push(
      await benchAsync(
        'V1 rounded (21×21)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              content: '123',
              typeNumber: 1,
              moduleSize: 10,
              moduleStyle: 'rounded',
              cornerRadius: 40,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    fullResults.push(
      await benchAsync(
        'V10 rounded (57×57)',
        async () => {
          await qr.generate(
            {
              ...BASE_CONFIG,
              content:
                'https://example.com/a-longer-payload-string-to-force-version-ten-or-higher-in-the-qr-code-benchmarks',
              typeNumber: 10,
              moduleSize: 4,
              moduleStyle: 'rounded',
              cornerRadius: 40,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    fullResults.push(
      await benchAsync(
        'V20 rounded (97×97)',
        async () => {
          const longContent = 'X'.repeat(500);
          await qr.generate(
            {
              ...BASE_CONFIG,
              content: longContent,
              typeNumber: 20,
              moduleSize: 3,
              errorCorrection: 'L',
              moduleStyle: 'rounded',
              cornerRadius: 40,
            },
            null
          );
        },
        ITERATIONS
      )
    );

    printResults('QR VERSION SCALING (full path, rounded)', fullResults);

    // Compute fast-path vs full-path ratio for version 10
    const v10Fast = results[2].avgMs;
    const v10Full = fullResults[1].avgMs;
    // biome-ignore lint/suspicious/noConsole: benchmark output
    console.log(
      `\n  V10 fast-path vs full-path: ${(v10Full / v10Fast).toFixed(2)}x speedup (${v10Full.toFixed(2)}ms → ${v10Fast.toFixed(2)}ms)\n`
    );

    for (const r of [...results, ...fullResults]) {
      expect(r.avgMs).toBeGreaterThan(0);
    }
  }, 120_000);
});
