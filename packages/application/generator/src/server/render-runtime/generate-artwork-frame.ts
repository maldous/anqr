import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "@/domain/qr/generator";
import type { QRGeneratorConfig } from "@/domain/qr/generator";
import { generateFullQArt, generateFullQArtOptimal } from "@/domain/qr/qart";
import type { ArtworkState } from "@/domain/render/server";
import type { ECCLevel } from "@/domain/render/server";

export async function generateArtworkFrame(
  targetCanvas: Canvas,
  frameIdx: number,
  normalizeRenderStyles: boolean,
  state: ArtworkState,
  data: string,
  ec: ECCLevel,
  version: number,
  maskPattern: "auto" | number,
  config: Record<string, unknown>,
  qrGenerator: QRGenerator,
): Promise<Canvas> {
  const useAutoMask = typeof maskPattern !== "number" || maskPattern < 0;
  const qartConfig = {
    data,
    targetImage: targetCanvas as unknown as ImageData,
    version: state.lockedVersion,
    ecc: ec,
    strictSuffix: true,
    targetControlPercent: 100,
    lockVersionToMinimum: version === 0 && frameIdx === 0,
  };

  const qartResult =
    useAutoMask && state.lockedMask < 0
      ? await generateFullQArtOptimal(qartConfig)
      : await generateFullQArt({
          ...qartConfig,
          maskPattern: state.lockedMask >= 0 ? state.lockedMask : (maskPattern as number),
        });

  if (!(qartResult.success && qartResult.matrix)) {
    throw new Error(qartResult.error || "QR-Art generation failed");
  }

  if (frameIdx === 0) {
    state.lockedMask = qartResult.maskPattern;
    state.lockedVersion = qartResult.version;
  }

  const qrArtConfig = {
    ...config,
    typeNumber: qartResult.version,
    overlayMode: undefined,
  };
  if (normalizeRenderStyles) {
    Object.assign(qrArtConfig, {
      moduleStyle: "square",
      finderStyle: "square",
      alignmentStyle: "square",
      timingStyle: "square",
      eyeOuterStyle: "square",
      eyeInnerStyle: "square",
      moduleGap: 0,
      gapMode: "none",
      cornerRadius: 0,
    });
  }

  return (await qrGenerator.renderFromMatrix(
    qartResult.matrix,
    qrArtConfig as unknown as QRGeneratorConfig,
  )) as unknown as Canvas;
}
