/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Run generator with slow-render status feedback.
 */

import type { QRGeneratorConfig } from "@/domain/qr/generator";
import { getQRGenerator } from "../generation/generation-singleton";

export async function runGeneratorWithSlowStatus(params: {
  cfg: QRGeneratorConfig;
  overlaySource: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  updateGenerationProgress: (stage: string, percent: number) => void;
  t: (key: string, fallback: string) => string;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let slowRenderTimer: ReturnType<typeof setTimeout> | null = null;
  slowRenderTimer = setTimeout(() => {
    if (!params.isStaleRequest()) {
      params.updateGenerationProgress(
        params.t(
          "preview.busy.stillRenderingDetailedOverlay",
          "Still rendering the detailed overlay...",
        ),
        72,
      );
    }
  }, 900);
  try {
    return await getQRGenerator().generate(params.cfg, params.overlaySource);
  } finally {
    if (slowRenderTimer) {
      clearTimeout(slowRenderTimer);
    }
  }
}
