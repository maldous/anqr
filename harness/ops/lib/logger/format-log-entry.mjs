import { getCallerInfo } from "./get-caller-info.mjs";
import { truncateText } from "./create-logger/truncate-text.mjs";

export function formatLogEntry(level, msg, data) {
  const { filename, lineNumber } = getCallerInfo();
  const location = filename ? `[${filename}:${lineNumber}]` : "";
  let line = `${prefix}${location} [${level}] ${truncateText(msg, 400)}`;
  if (data !== null && data !== undefined) {
    const serialized = safeSerialize(data);
    if (serialized) {
      line += ` ${serialized}`;
    }
  }
  return `${line}\n`;
}
