import { scanCanvas } from "./scanner";
import type { ScanSimulationResult } from "./safety.types";
import { applyBlurSimulation } from "./apply-blur-simulation";
import { applyNoiseSimulation } from "./apply-noise-simulation";

/**
 * Simulate scanning under various conditions
 */
export function simulateScan(
  canvas: HTMLCanvasElement,
  expectedContent: string,
  conditions: "ideal" | "blur" | "noise" | "low_light" = "ideal",
): ScanSimulationResult {
  let testCanvas = canvas;

  switch (conditions) {
    case "blur":
      testCanvas = applyBlurSimulation(canvas, 2);
      break;
    case "noise":
      testCanvas = applyNoiseSimulation(canvas, 0.1);
      break;
    case "low_light":
      testCanvas = applyNoiseSimulation(applyBlurSimulation(canvas, 1), 0.05);
      break;
  }

  const result = scanCanvas(testCanvas);

  return {
    success: result?.data === expectedContent,
    data: result?.data ?? null,
    confidence: result?.data === expectedContent ? 1 : 0,
    conditions,
  };
}
