export const isExportedNode = (node) => {
  if (typeof node.isExported === "function") {
    return node.isExported();
  }
  return false;
};
