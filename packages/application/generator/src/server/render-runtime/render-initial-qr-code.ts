import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "@/domain/qr/generator";
import type { AnyCanvas, QRGeneratorConfig } from "@/domain/qr/generator";
import type { ArtworkState, ParsedHandlerParams } from "@/domain/render/server";

import { generateArtworkFrame } from "./generate-artwork-frame";

export async function renderInitialQRCode(
  p: ParsedHandlerParams,
  config: Record<string, unknown>,
  overlayCanvas: Canvas | null,
  hasAnimatedOverlay: boolean,
  artworkState: ArtworkState,
  qrGenerator: QRGenerator,
): Promise<Canvas> {
  const isArtworkMode = p.overlayMode === "artwork";
  const useArtworkOverlayCompositing =
    isArtworkMode &&
    p.outputFormat === "gif" &&
    (hasAnimatedOverlay || p.animationPattern !== "none");
  if (isArtworkMode && overlayCanvas) {
    try {
      return await generateArtworkFrame(
        overlayCanvas,
        0,
        useArtworkOverlayCompositing,
        artworkState,
        p.data,
        p.ec,
        p.version,
        p.maskPattern,
        config,
        qrGenerator,
      );
    } catch {
      return (await qrGenerator.generate(
        config as unknown as QRGeneratorConfig,
        overlayCanvas as unknown as AnyCanvas,
      )) as unknown as Canvas;
    }
  }
  return (await qrGenerator.generate(
    config as unknown as QRGeneratorConfig,
    overlayCanvas as unknown as AnyCanvas,
  )) as unknown as Canvas;
}
