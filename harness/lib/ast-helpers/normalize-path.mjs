import path from "node:path";
import process from "node:process";

export const normalizePath = (filePath) =>
  path.relative(process.cwd(), filePath).replaceAll("\\", "/");
