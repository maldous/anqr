import { buildShareBaseConfig } from "../../features/generator/components/sections/build-share-base-config";
import type { BuildShareConfigInput } from "../../features/generator/components/sections/build-share-config-input.types";

export function buildHeaderShareConfig(params: Readonly<BuildShareConfigInput & { lang: string }>) {
  return {
    lang: params.lang,
    ...buildShareBaseConfig(params),
  };
}
