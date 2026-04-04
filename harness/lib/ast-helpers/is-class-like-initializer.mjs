// Generated from ../../scripts/lib/ast-helpers.mjs:20

import { SyntaxKind } from "ts-morph";

export const isClassLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ClassExpression;
