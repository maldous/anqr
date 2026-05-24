// Barrel re-export used by checks that do `import * as imports from "./imports.mjs"`.
// Sonar's "unused import" lint cannot see consumption through the namespace import,
// so DO NOT drop these — check-ast-density.mjs (and any future check using the same
// pattern) references them as `imports.execFileSync` / `imports.ROOT`.
import { execFileSync } from "node:child_process";
import { ROOT } from "./root.mjs";

export { execFileSync, ROOT };
