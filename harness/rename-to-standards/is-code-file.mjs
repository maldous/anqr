import path from "node:path";

import { CODE_EXTENSIONS } from "./code-extensions.mjs";

export const isCodeFile = (filePath) => {
  const base = path.basename(filePath);
  if (base.endsWith(".spec.ts") || base.endsWith(".spec.tsx")) return true;
  if (base.endsWith(".test.ts") || base.endsWith(".test.tsx")) return true;
  return [...CODE_EXTENSIONS].some((ext) => filePath.endsWith(ext));
};
