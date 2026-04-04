import { saveIndex } from "./save-index.mjs";

export async function flushIndex() {
  await saveIndex();
}
