import { ts } from "./ts.mjs";

export const isExported = (node) =>
  Array.isArray(node.modifiers) &&
  node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
