import type { GeneratorRuntimeConfig } from "./generator-runtime.types";
import { generatorRuntimeState } from "./generator-runtime-state";

export function configureGeneratorRuntime(config: GeneratorRuntimeConfig): void {
  generatorRuntimeState.current = config;
}
