// Generated from ../scripts/list-ast-names.mjs:42

export const isExportedNode = (node) => {
  if (typeof node.isExported === "function") {
    return node.isExported();
  }
  return false;
};
