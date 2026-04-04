import { SyntaxKind } from "ts-morph";

import { describeVariableDeclaration } from "./describe-variable-declaration.mjs";
import { isExportedNode } from "./is-exported-node.mjs";

export const collectTopLevelEntries = (sourceFile) => {
  const entries = [];

  for (const statement of sourceFile.getStatements()) {
    switch (statement.getKind()) {
      case SyntaxKind.FunctionDeclaration:
        entries.push({
          kind: "function",
          name: statement.getName() ?? "<anonymous>",
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.ClassDeclaration:
        entries.push({
          kind: "class",
          name: statement.getName() ?? "<anonymous>",
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.InterfaceDeclaration:
        entries.push({
          kind: "interface",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.TypeAliasDeclaration:
        entries.push({
          kind: "type",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.EnumDeclaration:
        entries.push({
          kind: "enum",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.ModuleDeclaration:
        entries.push({
          kind: "module",
          name: statement.getName(),
          exported: isExportedNode(statement),
          line: statement.getStartLineNumber(),
        });
        break;

      case SyntaxKind.VariableStatement:
        for (const declaration of statement.getDeclarations()) {
          entries.push(describeVariableDeclaration(statement, declaration));
        }
        break;

      default:
        break;
    }
  }

  return entries;
};
