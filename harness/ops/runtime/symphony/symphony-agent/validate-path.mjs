import { resolve, relative } from "node:path";

export function validatePath(projectRoot, filePath) {
  const resolved = resolve(projectRoot, filePath);
  const rel = relative(projectRoot, resolved);
  if (rel.startsWith("..") || resolve(projectRoot, rel) !== resolved) {
    throw new Error(`Path escapes project root: ${filePath}`);
  }
  if (rel.includes("node_modules") || rel === ".git" || rel.startsWith(".git/")) {
    throw new Error(`Access denied: ${filePath}`);
  }
  return resolved;
}
