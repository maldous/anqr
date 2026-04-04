// Generated from ../scripts/rename-to-standards.mjs:116

import { ts } from "./ts.mjs";

export const getDeclarationName = (node) => {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  return null;
};
