import type { StructuredLogEntry } from "./logger-types";

export function saveLogEntries(logs: StructuredLogEntry[], filename: string): void {
  if (typeof document === "undefined") return;
  if (logs.length === 0) return;

  const json = JSON.stringify(logs, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
