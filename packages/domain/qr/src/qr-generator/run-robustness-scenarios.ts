import type { CanvasPool } from "./canvas-pool";
import { simulateScenarioDecode } from "./qr-generator-helpers";

export async function runRobustnessScenarios(
  pool: CanvasPool,
  finalRaster: HTMLCanvasElement | OffscreenCanvas,
  scenarios: Array<{
    blur: number;
    exposure: number;
    skewX: number;
    skewY: number;
    downscale: number;
  }>,
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>,
): Promise<boolean> {
  for (const s of scenarios) {
    if (!(await simulateScenarioDecode(pool, finalRaster, s, runDecode))) {
      return false;
    }
  }
  return true;
}
