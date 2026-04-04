import { sep } from "node:path";

export function normalizePath(filePath) {
  return String(filePath).split(sep).join("/");
}
