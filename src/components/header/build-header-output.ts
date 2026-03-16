import type { StoreState } from "./store-state.type";
import { buildOutputFormatDetails } from "@/features/generator/components/sections/build-output-format-details";
import { buildSharedOutputFields } from "@/features/generator/components/sections/build-shared-output-fields";

export function buildHeaderOutput(output: StoreState["output"]) {
  return {
    ...buildSharedOutputFields(output),
    ...buildOutputFormatDetails(output),
  };
}
