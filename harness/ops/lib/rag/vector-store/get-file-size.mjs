import { stat } from "node:fs/promises";

export async function getFileSize(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}
