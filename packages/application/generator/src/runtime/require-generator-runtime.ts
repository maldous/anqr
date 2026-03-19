import type { GeneratorRuntimeConfig } from "./generator-runtime.types";
import { generatorRuntimeState } from "./generator-runtime-state";

export function requireGeneratorRuntime(): GeneratorRuntimeConfig {
  if (!generatorRuntimeState.current) {
    throw new Error("Generator runtime has not been configured");
  }
  return generatorRuntimeState.current;
}
