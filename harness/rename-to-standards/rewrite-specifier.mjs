// Generated from ../scripts/rename-to-standards.mjs:321

import path from "node:path";

import { ensureDot } from "./ensure-dot.mjs";
import { normalize } from "./normalize.mjs";
import { stripCodeExtension } from "./strip-code-extension.mjs";

export const rewriteSpecifier = (rawSpecifier, importerOldRel, importerNewRel, mapByOldNoExt) => {
  if (rawSpecifier.startsWith("@/")) {
    const oldTarget = normalize(`src/${rawSpecifier.slice(2)}`);
    const newTarget = mapByOldNoExt.get(oldTarget) ?? oldTarget;
    if (!newTarget.startsWith("src/")) return null;
    return `@/${stripCodeExtension(newTarget).slice(4)}`;
  }

  if (rawSpecifier.startsWith("./") || rawSpecifier.startsWith("../")) {
    const oldTarget = normalize(
      path.posix.normalize(path.posix.join(path.posix.dirname(importerOldRel), rawSpecifier)),
    );
    const newTarget = mapByOldNoExt.get(oldTarget) ?? oldTarget;
    const relSpec = normalize(path.posix.relative(path.posix.dirname(importerNewRel), newTarget));
    return ensureDot(stripCodeExtension(relSpec));
  }

  return null;
};
