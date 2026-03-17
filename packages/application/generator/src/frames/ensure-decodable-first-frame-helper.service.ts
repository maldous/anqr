/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Ensure first animation frame is decodable.
 */

import { createLogger } from "@/infra/logging/logger";
import { validateInWorker } from "@/modules/qr-analyzer";
import { cloneCanvasFrame } from "./clone-canvas-frame.service";

const log = createLogger("QR");

export async function ensureDecodableFirstFrameHelper(
  frames: (HTMLCanvasElement | OffscreenCanvas)[],
  expectedContent: string | undefined,
): Promise<void> {
  if (frames.length <= 1) return;
  if (!expectedContent) return;
  const firstFrameValidation = await validateInWorker(frames[0], expectedContent, 1);
  if (firstFrameValidation.valid) return;
  const candidates: number[] = [];
  const pushCandidate = (index: number) => {
    if (!Number.isFinite(index)) return;
    const normalized = Math.max(1, Math.min(frames.length - 1, Math.floor(index)));
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };
  pushCandidate(Math.floor(frames.length * 0.25));
  pushCandidate(Math.floor(frames.length * 0.5));
  pushCandidate(Math.floor(frames.length * 0.75));
  pushCandidate(frames.length - 1);
  for (const frameIdx of candidates) {
    const validation = await validateInWorker(frames[frameIdx], expectedContent, 1);
    if (!validation.valid) continue;
    frames[0] = cloneCanvasFrame(frames[frameIdx], null);
    log.info("animation cache: promoted decodable start frame", {
      sourceFrame: frameIdx,
      frameCount: frames.length,
    });
    return;
  }
  log.warn("animation cache: no decodable frame found for start frame promotion", {
    frameCount: frames.length,
  });
}
