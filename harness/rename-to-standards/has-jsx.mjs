// Generated from ../scripts/rename-to-standards.mjs:214

import { ts } from "./ts.mjs";

export const hasJsx = (sourceFile) => {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return found;
};
