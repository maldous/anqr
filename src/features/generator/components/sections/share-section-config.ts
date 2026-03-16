import { buildShareBaseConfig } from "./build-share-base-config";
import type { BuildShareConfigInput } from "./build-share-config-input.types";

export function buildShareConfig(params: BuildShareConfigInput) {
  return buildShareBaseConfig(params);
}
