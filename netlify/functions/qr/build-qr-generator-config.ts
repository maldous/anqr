import { buildBasicGeneratorConfig } from "@/application/generator/server";
import type { ParsedHandlerParams } from "./parsed-handler-params.types";

export function buildQRGeneratorConfig(
  p: ParsedHandlerParams,
  moduleSize: number,
): Record<string, unknown> {
  return buildBasicGeneratorConfig(p, moduleSize);
}
