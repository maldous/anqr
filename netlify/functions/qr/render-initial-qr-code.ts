import { type Canvas } from "@napi-rs/canvas";
import { QRGenerator } from "../../src/modules/qr-generator";
import { ParsedHandlerParams } from "./parsed-handler-params.types.ts";
import { ArtworkState } from "./artwork-state.types.ts";
import { generateArtworkFrame } from "./generate-artwork-frame.ts";

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
      /* (error_) {
      console.warn('[ARTWORK] full QR-Art failed, falling back to standard render', {
        error: error_ instanceof Error ? error_.message : String(error_),
      });
      */
      return await qrGenerator.generate(config, overlayCanvas);
    }
  }
  return await qrGenerator.generate(config, overlayCanvas);
}
