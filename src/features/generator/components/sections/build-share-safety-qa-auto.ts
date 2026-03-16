import type { StoreState } from "./share-config-store.types";
import { buildShareAutoFields } from "./build-share-auto-fields";
import { buildShareMetadataFields } from "./build-share-metadata-fields";
import { buildShareQaFields } from "./build-share-qa-fields";
import { buildShareSafetyFields } from "./build-share-safety-fields";
import { buildShareWatermarkFields } from "./build-share-watermark-fields";

export function buildShareSafetyQaAuto(
  safety: StoreState["safety"],
  qa: StoreState["qa"],
  auto: StoreState["auto"],
  watermark: StoreState["watermark"],
  metadata: StoreState["metadata"],
) {
  return {
    ...buildShareSafetyFields(safety),
    ...buildShareQaFields(qa),
    ...buildShareAutoFields(auto),
    ...buildShareWatermarkFields(watermark),
    ...buildShareMetadataFields(metadata),
  };
}
