/**
 * Compare QR-Art output for glasses input with two payloads.
 */

import { describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createCanvas } from '@napi-rs/canvas';

import { generateFullQArtOptimal, type FullQArtConfig } from '../../src/modules/qr-art/generate';
import { QRGenerator, type CanvasFactory, type QRGeneratorConfig } from '../../src/modules/qr-generator';

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

async function loadImageAsImageData(imagePath: string, targetSize: number): Promise<ImageData> {
  const absolutePath = path.resolve(process.cwd(), imagePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image not found: ${absolutePath}`);
  }

  const imageBuffer = await sharp(absolutePath)
    .resize(targetSize, targetSize, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = imageBuffer;
  return {
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
  } as ImageData;
}

function splitPayload(payload: string): { base: string; suffix: string } {
  const idx = payload.indexOf('#');
  if (idx < 0) return { base: payload, suffix: '' };
  return { base: payload.slice(0, idx), suffix: payload.slice(idx + 1) };
}

const nodeCanvasFactory: CanvasFactory = {
  createCanvas: async (width: number, height: number) => {
    return createCanvas(width, height) as unknown as HTMLCanvasElement;
  },
};

async function writeCanvasPNG(canvas: HTMLCanvasElement | OffscreenCanvas, outPath: string) {
  const buffer = (canvas as unknown as { toBuffer: (type?: string) => Buffer }).toBuffer('image/png');
  await fs.promises.writeFile(outPath, buffer);
}

async function renderMatrixPair(
  matrix: boolean[][],
  name: string,
  outputPrefix: string,
  moduleSize = 10
) {
  const generator = new QRGenerator(nodeCanvasFactory);
  const baseConfig: QRGeneratorConfig = {
    content: name,
    errorCorrection: 'L',
    typeNumber: 0,
    moduleSize,
    margin: 4,
    fgColor: '#000000',
    bgColor: '#ffffff',
  };

  const rawCanvas = await generator.renderFromMatrix(matrix, {
    ...baseConfig,
    rawMatrixRender: true,
  });

  const styledCanvas = await generator.renderFromMatrix(matrix, {
    ...baseConfig,
    rawMatrixRender: false,
  });

  const rawPath = path.resolve(process.cwd(), `${outputPrefix}-${name}-raw.png`);
  const styledPath = path.resolve(process.cwd(), `${outputPrefix}-${name}-styled.png`);
  await writeCanvasPNG(rawCanvas, rawPath);
  await writeCanvasPNG(styledCanvas, styledPath);

  const [rawMeta, styledMeta] = await Promise.all([
    sharp(rawPath).metadata(),
    sharp(styledPath).metadata(),
  ]);

  const width = (rawMeta.width || 0) + (styledMeta.width || 0);
  const height = Math.max(rawMeta.height || 0, styledMeta.height || 0);

  const combinedPath = path.resolve(process.cwd(), `${outputPrefix}-${name}-raw-vs-styled.png`);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([
      { input: rawPath, left: 0, top: 0 },
      { input: styledPath, left: rawMeta.width || 0, top: 0 },
    ])
    .png()
    .toFile(combinedPath);

  return { rawPath, styledPath, combinedPath };
}

describe('QR-Art glasses compare', () => {
  const imagePath = 'glasses-input.png';
  const version = 6; // as specified
  const moduleCount = 21 + 4 * (version - 1); // version->modules
  const targetSize = moduleCount * 4;

  const zipPayload = 'http://zip2.it/brqr#793618522169349375768512169081277855174341298682677390128336508746685343206314554540757831128512012765565340457163802334869373954682682661341296002959959682672725341202682890853371864448104673341141687721219362682984020043955491325341340146702703341956113384000533341141';
  const ourPayload = 'https://anqr.link#8255632460713072432059022367730687408032110778457163072023667872672058438602891941968262050773283927966292043072303936144064096142856141526226144058448268258992048144352032363084029151409688031952368195069471576088105792041158793231391008270752285292153069472028197232059';

  it('compares match quality and vectors applied', async () => {
    const targetImage = await loadImageAsImageData(imagePath, targetSize);

    const payloads = [
      { name: 'zip2', payload: zipPayload },
      { name: 'ours', payload: ourPayload },
    ];

    for (const entry of payloads) {
      const { base, suffix } = splitPayload(entry.payload);

      const config: FullQArtConfig = {
        data: base,
        suffix,
        autoSuffix: false,
        suffixMode: 'numeric',
        strictSuffix: true,
        targetImage,
        version,
        forceVersion: version,
        ecc: 'L',
      };

      const result = await generateFullQArtOptimal(config);

      const outputs = await renderMatrixPair(
        result.matrix,
        entry.name,
        'glasses'
      );

      // eslint-disable-next-line no-console
      console.log(`[glasses-compare] ${entry.name}: success=${result.success} version=${result.version} mask=${result.maskPattern} match=${result.matchPercentage.toFixed(1)}% vectors=${result.vectorsApplied}`);
      // eslint-disable-next-line no-console
      console.log(`[glasses-compare] ${entry.name} outputs:`, outputs);
    }
  }, 120000);
});
