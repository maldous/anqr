import type { AnimationFrame } from "./types";
import { log } from "./log";
import { parseWebPAsSingleFrame } from "./parse-web-p-as-single-frame";

/**
 * Parse animated WebP using ImageDecoder API
 */
export async function parseWebPFrames(source: ArrayBuffer): Promise<AnimationFrame[]> {
  if (typeof ImageDecoder === "undefined") {
    return parseWebPAsSingleFrame(source);
  }

  try {
    const decoder = new ImageDecoder({
      type: "image/webp",
      data: source,
    });

    await decoder.completed;

    const frameCount = decoder.tracks.selectedTrack?.frameCount || 1;
    const frames: AnimationFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      const { image } = result;
      const duration = image.duration;

      const canvas = document.createElement("canvas");
      canvas.width = image.displayWidth;
      canvas.height = image.displayHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0);
      }
      image.close();

      frames.push({
        canvas,
        delay: duration ? duration / 1000 : 100,
        disposalType: 0,
      });
    }

    decoder.close();
    return frames;
  } catch (err) {
    log.warn("ImageDecoder failed, falling back to single frame", { error: err });
    return parseWebPAsSingleFrame(source);
  }
}
