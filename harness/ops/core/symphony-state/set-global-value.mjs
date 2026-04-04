import { mutateState } from "./mutate-state.mjs";

export function setGlobalValue(key, value) {
  return mutateState((store) => {
    store.global[key] = value;
    return store;
  });
}
