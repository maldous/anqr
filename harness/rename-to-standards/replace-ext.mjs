// Generated from ../scripts/rename-to-standards.mjs:58

import { stripCodeExtension } from "./strip-code-extension.mjs";

export const replaceExt = (filePath, newExt) => `${stripCodeExtension(filePath)}${newExt}`;
