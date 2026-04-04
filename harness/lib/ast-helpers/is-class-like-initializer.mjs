import { SyntaxKind } from "ts-morph";

export const isClassLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ClassExpression;
