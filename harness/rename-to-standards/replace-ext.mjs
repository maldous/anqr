import { stripCodeExtension } from "./strip-code-extension.mjs";

export const replaceExt = (filePath, newExt) => `${stripCodeExtension(filePath)}${newExt}`;
