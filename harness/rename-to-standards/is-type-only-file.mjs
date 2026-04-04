// Generated from ../scripts/rename-to-standards.mjs:236

import { isTypeOnlyStatement } from "./is-type-only-statement.mjs";

export const isTypeOnlyFile = (sourceFile) => sourceFile.statements.every(isTypeOnlyStatement);
