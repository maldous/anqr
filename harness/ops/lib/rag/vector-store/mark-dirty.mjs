import { setIndexDirty } from "./index-dirty.mjs";

export function markDirty() {
  setIndexDirty(true);
}
