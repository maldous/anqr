import { sampleBlueNoise } from "../dither";
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
} from "./types";
import { log } from "./log";
import { rgbToLumaSrgb } from "./rgb-to-luma-srgb";
import { pixelIndex } from "./pixel-index";
import { packColor } from "./pack-color";
import { bitsToMatrix } from "./bits-to-matrix";
import { packedColorsToMatrix } from "./packed-colors-to-matrix";
import { getBlueNoiseTileCached } from "./get-blue-noise-tile-cached";
import { computeFinalShade } from "./compute-final-shade";
import { resolveMatrixInput } from "./resolve-matrix-input";
import type { RGBi } from "./rg-bi";

export async function generateBWFirstMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void,
): Promise<PixelDecisionMatrix> {
  const matrixInput = await resolveMatrixInput({
    createCanvasFn,
    effectiveIntensity,
    moduleCount,
    overlayCanvas,
    releaseCanvasFn,
    scale,
  });
  if ("emptyMatrix" in matrixInput) {
    return matrixInput.emptyMatrix;
  }
  const { data, matrixBits, packedColors, scaledSize } = matrixInput;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  const clampByte = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));
  const mapShadeWithSourceColor = (
    srcR: number,
    srcG: number,
    srcB: number,
    shade: number,
    qrDark: boolean,
  ): RGBi => {
    const gray = (srcR + srcG + srcB) / 3;
    const chromaScale = qrDark ? 0.9 : 0.58;
    let rOut = gray + (srcR - gray) * chromaScale;
    let gOut = gray + (srcG - gray) * chromaScale;
    let bOut = gray + (srcB - gray) * chromaScale;
    const currentShade = rgbToLumaSrgb(clampByte(rOut), clampByte(gOut), clampByte(bOut)) * 255;
    const delta = shade - currentShade;
    rOut += delta;
    gOut += delta;
    bOut += delta;
    return { r: clampByte(rOut), g: clampByte(gOut), b: clampByte(bOut) };
  };

  // How much the overlay influences the shade (0 = no texture, 1 = full texture range)
  const textureAmount = Math.min(1, effectiveIntensity);

  // Generate blue noise tile for dithering texture
  const seed = config.blueNoiseSeed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const blueNoiseTile = getBlueNoiseTileCached(tileSize, seed);

  // Contrast curve power - higher values increase contrast of the spiral
  const contrastPower = 1.5;

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const sampleIdx = pixelIndex(x, y, scaledSize);
      const idx = sampleIdx * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      matrixBits[sampleIdx] = qrIsDark ? 1 : 0;

      let overlayBrightness = rgbToLumaSrgb(r, g, b);
      overlayBrightness = overlayBrightness ** contrastPower;

      const noise = sampleBlueNoise(x, y, blueNoiseTile, tileSize);
      const noiseVariation = (noise - 0.5) * 0.3;

      const shade = computeFinalShade(
        overlayBrightness,
        textureAmount,
        noiseVariation,
        qrIsDark,
        moduleRow,
        moduleCol,
        moduleCount,
        version,
        config,
      );

      if (config.colorMode !== "bw") {
        const mapped = mapShadeWithSourceColor(r, g, b, shade, qrIsDark);
        packedColors[sampleIdx] = packColor(mapped.r, mapped.g, mapped.b);
      }
    }
  }

  log.debug("QR-first B&W matrix generated", {
    scaledSize,
    moduleCount,
    scale,
    textureAmount,
    contrastPower,
    mode: "bw-first",
  });

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}
