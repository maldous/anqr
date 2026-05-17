import path from "node:path";

export function resolveKnownFileName(rawName, validFiles) {
  if (validFiles.includes(rawName)) return rawName;
  const basename = path.basename(rawName);
  return validFiles.includes(basename) ? basename : null;
}
