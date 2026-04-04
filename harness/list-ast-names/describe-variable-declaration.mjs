// Generated from ../scripts/list-ast-names.mjs:49

import {
  isFunctionLikeInitializer,
  isClassLikeInitializer,
  isObjectLikeInitializer,
  isIifeInitializer,
} from "../lib/ast-helpers.mjs";

import { isExportedNode } from "./is-exported-node.mjs";

export const describeVariableDeclaration = (statement, declaration) => {
  const initializer = declaration.getInitializer();
  const name = declaration.getName();
  const exported = isExportedNode(statement);
  const line = declaration.getStartLineNumber();

  if (isFunctionLikeInitializer(initializer)) {
    return {
      kind: "variable.arrow_function",
      name,
      exported,
      line,
    };
  }

  if (isClassLikeInitializer(initializer)) {
    return {
      kind: "variable.class_expression",
      name,
      exported,
      line,
    };
  }

  if (isIifeInitializer(initializer)) {
    return {
      kind: "variable.iife",
      name,
      exported,
      line,
    };
  }

  if (isObjectLikeInitializer(initializer)) {
    return {
      kind: "variable.object_literal",
      name,
      exported,
      line,
    };
  }

  return {
    kind: "variable",
    name,
    exported,
    line,
  };
};
