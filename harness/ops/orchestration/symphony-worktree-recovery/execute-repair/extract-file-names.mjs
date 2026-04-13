export function extractFileNames(dirtyFiles) {
  return dirtyFiles
    .map((line) =>
      line
        .replace(/^\S+\s+/, "")
        .trim()
        .split("/")
        .pop(),
    )
    .filter(Boolean);
}
