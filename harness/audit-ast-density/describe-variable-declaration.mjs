import {
  isFunctionLikeInitializer,
  isClassLikeInitializer,
  isObjectLikeInitializer,
  isIifeInitializer,
} from "../lib/ast-helpers.mjs";

export const describeVariableDeclaration = (declaration) => {
  const initializer = declaration.getInitializer();
  const name = declaration.getName();

  if (isFunctionLikeInitializer(initializer)) {
    return {
      kind: "variable.arrow_function",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isClassLikeInitializer(initializer)) {
    return {
      kind: "variable.class_expression",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isIifeInitializer(initializer)) {
    return {
      kind: "variable.iife",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  if (isObjectLikeInitializer(initializer)) {
    return {
      kind: "variable.object_literal",
      name,
      line: declaration.getStartLineNumber(),
    };
  }

  return null;
};
