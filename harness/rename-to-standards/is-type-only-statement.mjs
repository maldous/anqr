import { ts } from "./ts.mjs";

export const isTypeOnlyStatement = (statement) =>
  ts.isImportDeclaration(statement) ||
  ts.isExportDeclaration(statement) ||
  ts.isInterfaceDeclaration(statement) ||
  ts.isTypeAliasDeclaration(statement) ||
  ts.isEnumDeclaration(statement) ||
  ts.isEmptyStatement(statement);
