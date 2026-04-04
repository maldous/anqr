import { isTypeOnlyStatement } from "./is-type-only-statement.mjs";

export const isTypeOnlyFile = (sourceFile) => sourceFile.statements.every(isTypeOnlyStatement);
