import path from "node:path";
import process from "node:process";
import { SyntaxKind } from "ts-morph";

export const DEFAULT_GLOBS = [
  "**/*.{ts,tsx,d.ts}",
  "!**/node_modules/**",
  "!**/.git/**",
  "!**/dist/**",
  "!scripts/**",
];

export const normalizePath = (filePath) =>
  path.relative(process.cwd(), filePath).replaceAll("\\", "/");

export const isFunctionLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ArrowFunction ||
  initializer?.getKind() === SyntaxKind.FunctionExpression;

export const isClassLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ClassExpression;

export const isObjectLikeInitializer = (initializer) =>
  initializer?.getKind() === SyntaxKind.ObjectLiteralExpression;

export const isIifeInitializer = (initializer) => {
  if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) return false;
  const expression = initializer.getExpression();
  return (
    expression.getKind() === SyntaxKind.FunctionExpression ||
    expression.getKind() === SyntaxKind.ArrowFunction ||
    expression.getKind() === SyntaxKind.ParenthesizedExpression
  );
};

export const setupEpipeHandler = () => {
  process.stdout.on("error", (error) => {
    if (error?.code === "EPIPE") {
      process.exit(0);
    }
    throw error;
  });
};
