import { createCanvas } from '@napi-rs/canvas';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type CanvasFactory,
  QRGenerator,
  type QRGeneratorConfig,
} from '../../src/modules/qr-generator';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../../src/modules/qr-spec/qr-patterns';

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

function createSyntheticOverlay(size: number): any {
  const overlay = createCanvas(size, size);
  const ctx = overlay.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const waveA = Math.sin((x / size) * Math.PI * 9 + (y / size) * Math.PI * 3);
      const waveB = Math.cos((x / size) * Math.PI * 5 - (y / size) * Math.PI * 8);
      const checker = ((Math.floor(x / 11) + Math.floor(y / 7)) % 2) * 2 - 1;
      const mix = 0.5 + 0.25 * waveA + 0.2 * waveB + 0.05 * checker;
      const clamped = Math.max(0, Math.min(1, mix));
      data[i] = Math.round((0.15 + clamped * 0.85) * 255);
      data[i + 1] = Math.round((0.1 + (1 - clamped) * 0.7) * 255);
      data[i + 2] = Math.round((0.2 + Math.abs(waveA * waveB) * 0.75) * 255);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return overlay as any;
}

function isFinderModuleOrSeparator(row: number, col: number, moduleCount: number): boolean {
  const isSeparator =
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8);
  return isFinderPattern(row, col, moduleCount) || isSeparator;
}

function meanModuleCenterRgbDeltaByMask(
  canvasA: any,
  canvasB: any,
  moduleCount: number,
  marginModules: number,
  include: (row: number, col: number, moduleCount: number, version: number) => boolean
): { inside: number; outside: number; insideCount: number; outsideCount: number } {
  const ctxA = canvasA.getContext('2d');
  const ctxB = canvasB.getContext('2d');
  const dataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height).data;
  const dataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height).data;
  const version = Math.ceil((moduleCount - 17) / 4);
  const pitch = canvasA.width / Math.max(1, moduleCount + marginModules * 2);
  const offset = marginModules * pitch;

  const rgbDeltaAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(canvasA.width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(canvasA.height - 1, Math.round(y)));
    const idx = (yy * canvasA.width + xx) * 4;
    return (
      (Math.abs(dataA[idx] - dataB[idx]) +
        Math.abs(dataA[idx + 1] - dataB[idx + 1]) +
        Math.abs(dataA[idx + 2] - dataB[idx + 2])) /
      3
    );
  };

  let insideSum = 0;
  let outsideSum = 0;
  let insideCount = 0;
  let outsideCount = 0;

  const sampleFractions = [0.22, 0.5, 0.78];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      let deltaSum = 0;
      let deltaCount = 0;
      for (const fy of sampleFractions) {
        for (const fx of sampleFractions) {
          const sx = offset + (col + fx) * pitch;
          const sy = offset + (row + fy) * pitch;
          deltaSum += rgbDeltaAt(sx, sy);
          deltaCount++;
        }
      }
      const delta = deltaSum / Math.max(1, deltaCount);
      if (include(row, col, moduleCount, version)) {
        insideSum += delta;
        insideCount++;
      } else {
        outsideSum += delta;
        outsideCount++;
      }
    }
  }

  return {
    inside: insideSum / Math.max(1, insideCount),
    outside: outsideSum / Math.max(1, outsideCount),
    insideCount,
    outsideCount,
  };
}

const AUDIT_MODES = [
  'blend',
  'halftone',
  'halftone-dithered',
  'mosaic',
  'gapfill',
  'brightness',
  'duotone',
  'pixelate',
  'outline',
  'wave',
  'dithered',
  'blue-noise',
  'subpixel',
  'subpixel-size',
  'dither',
  'extreme',
] as const;

const SCALED_MODES = [
  'dithered',
  'blue-noise',
  'subpixel',
  'subpixel-size',
  'dither',
  'extreme',
] as const;

const TOGGLE_CASES = [
  {
    key: 'preserveFinders' as const,
    mask: (row: number, col: number, moduleCount: number) =>
      isFinderModuleOrSeparator(row, col, moduleCount),
  },
  {
    key: 'preserveTiming' as const,
    mask: (row: number, col: number, moduleCount: number) => isTimingPattern(row, col, moduleCount),
  },
  {
    key: 'preserveAlignment' as const,
    mask: (row: number, col: number, moduleCount: number, version: number) =>
      isAlignmentPattern(row, col, moduleCount, version),
  },
  {
    key: 'protectFormatInfo' as const,
    mask: (row: number, col: number, moduleCount: number) => isFormatInfo(row, col, moduleCount),
  },
  {
    key: 'protectVersionInfo' as const,
    mask: (row: number, col: number, moduleCount: number, version: number) =>
      isVersionInfo(row, col, moduleCount, version),
  },
];

describe('overlay preservation wiring audit by mode', () => {
  let overlay: any;
  beforeAll(async () => {
    overlay = createSyntheticOverlay(220);
  });

  function baseConfig(mode: (typeof AUDIT_MODES)[number]): QRGeneratorConfig {
    return {
      content: 'https://anqr.link/overlay-preservation-audit',
      errorCorrection: 'H',
      typeNumber: 8,
      moduleSize: 12,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: mode,
      overlayIntensity: 90,
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
      finderDitherStrength: 70,
      blendPreservations: false,
      scanGateProfile: 'off',
    };
  }

  async function render(mode: (typeof AUDIT_MODES)[number], patch: Partial<QRGeneratorConfig>) {
    const qr = new QRGenerator(nodeCanvasFactory);
    const canvas = await qr.generate({ ...baseConfig(mode), ...patch }, overlay);
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();
    return { canvas, moduleCount: matrixData!.matrix.length };
  }

  for (const mode of AUDIT_MODES) {
    for (const testCase of TOGGLE_CASES) {
      it(`${mode}: ${testCase.key} toggle changes its target region more than non-target regions`, async () => {
        const base = await render(mode, {});
        const toggled = await render(mode, { [testCase.key]: false });

        const locality = meanModuleCenterRgbDeltaByMask(
          base.canvas,
          toggled.canvas,
          base.moduleCount,
          4,
          testCase.mask
        );

        expect(locality.insideCount).toBeGreaterThan(0);
        expect(locality.inside).toBeGreaterThan(0.4);
        expect(locality.inside).toBeGreaterThan(locality.outside * 1.03);
      }, 20000);
    }
  }
});

describe('blendPreservations wiring across scaled modes', () => {
  let overlay: any;
  beforeAll(async () => {
    overlay = createSyntheticOverlay(220);
  });

  function configForScaledMode(mode: (typeof SCALED_MODES)[number]): QRGeneratorConfig {
    return {
      content: 'https://anqr.link/blend-preservations-mode-audit',
      errorCorrection: 'H',
      typeNumber: 8,
      moduleSize: 12,
      margin: 4,
      fgColor: '#000000',
      bgColor: '#ffffff',
      overlayMode: mode,
      overlayIntensity: 90,
      colorMode: 'color',
      ditherKind: 'error_diffusion',
      ditherStrength: 50,
      ditherSerpentine: false,
      diffusionKernel: 'floyd_steinberg',
      renderScalePerModule: 14,
      seed: 42,
      preserveFinders: false,
      preserveTiming: false,
      preserveAlignment: false,
      protectFormatInfo: false,
      protectVersionInfo: false,
      finderDitherStrength: 70,
      scanGateProfile: 'off',
    };
  }

  async function render(
    mode: (typeof SCALED_MODES)[number],
    blendPreservations: boolean,
    blendPreservationMode: 'overlay' | 'dither' = 'overlay'
  ) {
    const qr = new QRGenerator(nodeCanvasFactory);
    const canvas = await qr.generate(
      {
        ...configForScaledMode(mode),
        blendPreservations,
        blendPreservationMode,
      },
      overlay
    );
    const matrixData = qr.getLastMatrix();
    expect(matrixData).not.toBeNull();
    return { canvas, moduleCount: matrixData!.matrix.length };
  }

  const functionalMask = (row: number, col: number, moduleCount: number, version: number) =>
    isFinderModuleOrSeparator(row, col, moduleCount) ||
    isTimingPattern(row, col, moduleCount) ||
    isAlignmentPattern(row, col, moduleCount, version) ||
    isFormatInfo(row, col, moduleCount) ||
    isVersionInfo(row, col, moduleCount, version);

  for (const mode of SCALED_MODES) {
    it(`${mode}: blendPreservations changes functional-region rendering`, async () => {
      const flat = await render(mode, false);
      const blended = await render(mode, true);
      const locality = meanModuleCenterRgbDeltaByMask(
        flat.canvas,
        blended.canvas,
        flat.moduleCount,
        4,
        functionalMask
      );
      expect(locality.insideCount).toBeGreaterThan(0);
      expect(locality.inside).toBeGreaterThan(0.5);
    }, 20000);
  }

  const MODE_SWITCH_CASES = ['dithered', 'blue-noise', 'dither', 'extreme'] as const;
  for (const mode of MODE_SWITCH_CASES) {
    it(`${mode}: blendPreservationMode changes functional-region rendering`, async () => {
      const overlayStyled = await render(mode, true, 'overlay');
      const ditherStyled = await render(mode, true, 'dither');
      const locality = meanModuleCenterRgbDeltaByMask(
        overlayStyled.canvas,
        ditherStyled.canvas,
        overlayStyled.moduleCount,
        4,
        functionalMask
      );
      expect(locality.insideCount).toBeGreaterThan(0);
      expect(locality.inside).toBeGreaterThan(0.08);
      expect(locality.inside).toBeGreaterThan(locality.outside * 1.02);
    }, 20000);
  }
});
