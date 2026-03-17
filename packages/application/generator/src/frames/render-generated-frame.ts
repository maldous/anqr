import type { QRGeneratorConfig } from "@/modules/qr-generator";
import { qrGenerator } from "../generation/generation-singleton";

export async function renderGeneratedFrame(
  params: Readonly<{
    frame: HTMLCanvasElement | OffscreenCanvas;
    frameIdx: number;
    generateArtworkFrame: (
      c: HTMLCanvasElement | OffscreenCanvas,
      fi: number,
    ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
    isArtworkMode: boolean;
    moduleJitterPx?: number;
    previewScanConfigBase: QRGeneratorConfig;
    temporalOffset: number;
  }>,
): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    moduleJitterPx: params.moduleJitterPx,
    temporalOffset: params.temporalOffset,
  };

  return params.isArtworkMode
    ? await params.generateArtworkFrame(params.frame, params.frameIdx)
    : await qrGenerator.generate(frameConfig, params.frame);
}
