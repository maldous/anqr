import { extractFileNames } from "./extract-file-names.mjs";

export function formatFileSummary(dirtyFiles) {
  const names = extractFileNames(dirtyFiles);
  if (names.length === 0) return "files updated";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} (+${names.length - 2} more)`;
}
