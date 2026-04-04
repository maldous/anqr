// Generated from ../scripts/list-ast-names.mjs:207

export const formatGroupedFile = (group) => {
  const lines = [group.path];
  for (const entry of group.entries) {
    lines.push(
      `  L${String(entry.line).padStart(4, " ")}  ${entry.kind.padEnd(24, " ")}  ${entry.exported ? "export" : "local "}  ${entry.name}`,
    );
  }
  return lines.join("\n");
};
