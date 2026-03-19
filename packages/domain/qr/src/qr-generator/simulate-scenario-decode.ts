import type { CanvasPool } from "./canvas-pool";

export async function simulateScenarioDecode(
  pool: CanvasPool,
  finalRaster: HTMLCanvasElement | OffscreenCanvas,
  scenario: { blur: number; exposure: number; skewX: number; skewY: number; downscale: number },
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>,
): Promise<boolean> {
  const sim = await pool.acquire(finalRaster.width, finalRaster.height);
  try {
    const simCtx = sim.getContext("2d") as CanvasRenderingContext2D | null;
    if (!simCtx) return false;

    const dsW = Math.max(1, Math.round(finalRaster.width * scenario.downscale));
    const dsH = Math.max(1, Math.round(finalRaster.height * scenario.downscale));
    const ds = await pool.acquire(dsW, dsH);
    try {
      const dsCtx = ds.getContext("2d") as CanvasRenderingContext2D | null;
      if (!dsCtx) return false;
      dsCtx.imageSmoothingEnabled = true;
      dsCtx.drawImage(finalRaster as CanvasImageSource, 0, 0, dsW, dsH);

      if ("filter" in simCtx) {
        simCtx.filter = `blur(${scenario.blur}px)`;
      }
      simCtx.setTransform(1, -scenario.skewY / sim.height, scenario.skewX / sim.width, 1, 0, 0);
      simCtx.drawImage(
        ds as CanvasImageSource,
        0,
        0,
        dsW,
        dsH,
        0,
        0,
        Math.max(1, sim.width - Math.abs(scenario.skewX)),
        Math.max(1, sim.height - Math.abs(scenario.skewY)),
      );
      simCtx.setTransform(1, 0, 0, 1, 0, 0);
      if ("filter" in simCtx) {
        simCtx.filter = "none";
      }
      if (scenario.exposure !== 0) {
        simCtx.globalCompositeOperation = "source-atop";
        simCtx.fillStyle =
          scenario.exposure > 0
            ? `rgba(255,255,255,${Math.min(0.35, scenario.exposure)})`
            : `rgba(0,0,0,${Math.min(0.35, Math.abs(scenario.exposure))})`;
        simCtx.fillRect(0, 0, sim.width, sim.height);
        simCtx.globalCompositeOperation = "source-over";
      }

      return await runDecode(sim);
    } finally {
      pool.release(ds);
    }
  } finally {
    pool.release(sim);
  }
}
