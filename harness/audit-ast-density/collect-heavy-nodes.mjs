// Generated from ../scripts/audit-ast-density.mjs:91

import { SyntaxKind } from "ts-morph";

import { describeVariableDeclaration } from "./describe-variable-declaration.mjs";

export const collectHeavyNodes = (sourceFile) => {
  const heavyNodes = [];

  for (const statement of sourceFile.getStatements()) {
    switch (statement.getKind()) {
      case SyntaxKind.FunctionDeclaration: {
        heavyNodes.push({
          kind: "function",
          name: statement.getName() ?? "<anonymous>",
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.ClassDeclaration: {
        heavyNodes.push({
          kind: "class",
          name: statement.getName() ?? "<anonymous>",
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.InterfaceDeclaration: {
        heavyNodes.push({
          kind: "interface",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.TypeAliasDeclaration: {
        heavyNodes.push({
          kind: "type",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.EnumDeclaration: {
        heavyNodes.push({
          kind: "enum",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.ModuleDeclaration: {
        heavyNodes.push({
          kind: "module",
          name: statement.getName(),
          line: statement.getStartLineNumber(),
        });
        break;
      }
      case SyntaxKind.VariableStatement: {
        for (const declaration of statement.getDeclarations()) {
          const description = describeVariableDeclaration(declaration);
          if (description) heavyNodes.push(description);
        }
        break;
      }
      default:
        break;
    }
  }

  return heavyNodes;
};
