import { resolve, dirname } from "node:path";

export const MAIN_REPO_ROOT = resolve(
  dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "..",
);
