import type { GeneratorRuntimeConfig } from "./generator-runtime.types";

export const generatorRuntimeState: { current: GeneratorRuntimeConfig | null } = {
  current: null,
};
