import { extname } from "node:path";

export function isSupportedFile(filePath, extensions) {
  return extensions.includes(extname(filePath).toLowerCase());
}
