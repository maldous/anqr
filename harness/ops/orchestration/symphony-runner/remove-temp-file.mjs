import { unlinkSync } from "node:fs";

export function removeTempFile(filePath) {
  if (!filePath) return;
  try {
    unlinkSync(filePath);
  } catch {}
}
