// Generated from ../../scripts/lib/ast-helpers.mjs:26

import { SyntaxKind } from "ts-morph";

export const isIifeInitializer = (initializer) => {
  if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) return false;
  const expression = initializer.getExpression();
  return (
    expression.getKind() === SyntaxKind.FunctionExpression ||
    expression.getKind() === SyntaxKind.ArrowFunction ||
    expression.getKind() === SyntaxKind.ParenthesizedExpression
  );
};
