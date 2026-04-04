export const isPureTypeDeclarationFile = (entry) =>
  entry.path.endsWith(".types.ts") &&
  entry.nodes.length > 0 &&
  entry.nodes.every((node) => node.kind === "interface" || node.kind === "type");
