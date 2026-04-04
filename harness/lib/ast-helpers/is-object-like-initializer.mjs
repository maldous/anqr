// Generated from ../../scripts/lib/ast-helpers.mjs:23

import { SyntaxKind } from "ts-morph";

export const isObjectLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ObjectLiteralExpression;
