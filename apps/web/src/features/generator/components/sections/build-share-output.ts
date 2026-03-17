import type { StoreState } from "./share-config-store.types";
import { buildOutputFormatDetails } from "./build-output-format-details";
import { buildSharedOutputFields } from "./build-shared-output-fields";

export function buildShareOutput(output: StoreState["output"]) {
  return {
    ...buildSharedOutputFields(output),
    ...buildOutputFormatDetails(output),
  };
}
