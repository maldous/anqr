import { scriptKindFor } from "./script-kind-for.mjs";
import { ts } from "./ts.mjs";

export const createSourceFile = (filePath, text) =>
  ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKindFor(filePath));
