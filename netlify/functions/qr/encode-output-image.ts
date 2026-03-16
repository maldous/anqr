import { type Canvas } from "@napi-rs/canvas";
import { OutputFormat } from "./output-format.types.ts";
import { ServerAnimationFrame } from "./server-animation-frame.types.ts";
import { PngMetadata } from "./png-metadata.types.ts";
import { withGifEncodeLock } from "./with-gif-encode-lock.ts";
import { encodeAnimatedGifWithDelays } from "./encode-animated-gif-with-delays.ts";
import { qrFnLog } from "./qr-fn-log.ts";
import { encodeAnimatedGif } from "./encode-animated-gif.ts";
import { encodeGif } from "./encode-gif.ts";
import { embedPngMetadataAndDpi } from "./embed-png-metadata-and-dpi.ts";

export async function encodeOutputImage(
  outputFormat: OutputFormat,
  animatedOverlayFrames: ServerAnimationFrame[],
  animationFrameCanvases: Canvas[],
  outputCanvas: Canvas,
  gifColors: number,
  gifDisposalCode: number,
  gifBackgroundColor: string,
  transparent: boolean,
  animationSpeed: number,
  webpQuality: number,
  outputQuality: number,
  metadata: PngMetadata | undefined,
  outputDpi: number,
): Promise<{ buffer: Buffer; contentType: string }> {
  switch (outputFormat) {
    case "gif":
      if (animatedOverlayFrames.length > 1) {
        const tEncode = Date.now();
        const buffer = await withGifEncodeLock(() =>
          encodeAnimatedGifWithDelays(
            animatedOverlayFrames,
            gifColors,
            gifDisposalCode,
            gifBackgroundColor,
            transparent,
          ),
        );
        qrFnLog("[TIMING] GIF encoding", {
          frames: animatedOverlayFrames.length,
          encodeMs: Date.now() - tEncode,
          size: buffer.byteLength,
        });
        return { buffer, contentType: "image/gif" };
      }
      if (animationFrameCanvases.length > 1) {
        const buffer = await withGifEncodeLock(() =>
          encodeAnimatedGif(
            animationFrameCanvases,
            animationSpeed,
            gifColors,
            gifDisposalCode,
            gifBackgroundColor,
            transparent,
          ),
        );
        return { buffer, contentType: "image/gif" };
      }
      {
        const buffer = await withGifEncodeLock(() =>
          encodeGif(outputCanvas, gifColors, gifDisposalCode, gifBackgroundColor, transparent),
        );
        return { buffer, contentType: "image/gif" };
      }

    case "webp": {
      const finalWebpQuality = webpQuality === 90 ? Math.round(outputQuality * 100) : webpQuality;
      return {
        buffer: outputCanvas.toBuffer("image/webp", finalWebpQuality),
        contentType: "image/webp",
      };
    }
    default: {
      let buffer = outputCanvas.toBuffer("image/png");
      if (metadata || outputDpi !== 72) {
        buffer = embedPngMetadataAndDpi(buffer, metadata, outputDpi);
      }
      return { buffer, contentType: "image/png" };
    }
  }
}
