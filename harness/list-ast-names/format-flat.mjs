export const formatFlat = (item) =>
  `${item.path}:${String(item.line).padStart(4, " ")}  ${item.kind.padEnd(24, " ")}  ${item.exported ? "export" : "local "}  ${item.name}`;
