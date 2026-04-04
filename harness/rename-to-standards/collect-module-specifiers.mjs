// Generated from ../scripts/rename-to-standards.mjs:183

import { ts } from "./ts.mjs";

export const collectModuleSpecifiers = (sourceFile) => {
  const items = [];
  for (const statement of sourceFile.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      items.push({
        value: statement.moduleSpecifier.text,
        start: statement.moduleSpecifier.getStart(sourceFile) + 1,
        end: statement.moduleSpecifier.getEnd() - 1,
      });
      continue;
    }
    if (
      ts.isImportEqualsDeclaration(statement) &&
      ts.isExternalModuleReference(statement.moduleReference) &&
      statement.moduleReference.expression &&
      ts.isStringLiteral(statement.moduleReference.expression)
    ) {
      items.push({
        value: statement.moduleReference.expression.text,
        start: statement.moduleReference.expression.getStart(sourceFile) + 1,
        end: statement.moduleReference.expression.getEnd() - 1,
      });
    }
  }
  return items;
};
