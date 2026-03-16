import type { StoreState } from "./share-config-store-state.type";

export function buildShareAutoFields(auto: StoreState["auto"]) {
  return {
    autoPickVersion: auto.pickVersion === false ? false : undefined,
    autoPickEcc: auto.pickEcc ? true : undefined,
    autoReduceIntensity: auto.reduceIntensityUntilSafe ? true : undefined,
  };
}
