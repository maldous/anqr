import { getDeclarationName } from "./get-declaration-name.mjs";
import { isExported } from "./is-exported.mjs";
import { ts } from "./ts.mjs";

export const getTopLevelEntries = (sourceFile) => {
  const entries = [];
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement)) {
      entries.push({
        kind: "function",
        name: getDeclarationName(statement),
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isClassDeclaration(statement)) {
      entries.push({
        kind: "class",
        name: getDeclarationName(statement),
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isInterfaceDeclaration(statement)) {
      entries.push({
        kind: "interface",
        name: statement.name.text,
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      entries.push({ kind: "type", name: statement.name.text, exported: isExported(statement) });
      continue;
    }
    if (ts.isEnumDeclaration(statement)) {
      entries.push({ kind: "enum", name: statement.name.text, exported: isExported(statement) });
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const name = ts.isIdentifier(declaration.name) ? declaration.name.text : null;
        let kind = "variable";
        if (
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          kind = "variable.function";
        } else if (
          declaration.initializer &&
          ts.isObjectLiteralExpression(declaration.initializer)
        ) {
          kind = "variable.object";
        }
        entries.push({ kind, name, exported: isExported(statement) });
      }
    }
  }
  return entries;
};
