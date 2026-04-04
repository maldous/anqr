import { logWarn } from "./logger.mjs";
export function logWorkingTreeEntries(prefix, entries) {
  for (const entry of entries.slice(0, 25)) {
    logWarn(`${prefix} ${entry.status} ${entry.file}`);
  }
  if (entries.length > 25) {
    logWarn(`${prefix} ... and ${entries.length - 25} more`);
  }
}
