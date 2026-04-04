import { SyntaxKind } from "ts-morph";

export const isFunctionLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ArrowFunction ||
  initializer?.getKind() === SyntaxKind.FunctionExpression;
