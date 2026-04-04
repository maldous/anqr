import { SyntaxKind } from "ts-morph";

export const isObjectLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ObjectLiteralExpression;
