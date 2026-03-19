import type { CanvasFactory } from "@/domain/render/canvas";
import { requireGeneratorRuntime } from "./require-generator-runtime";

export function getGeneratorCanvasFactory(): CanvasFactory {
  return requireGeneratorRuntime().canvasFactory;
}
