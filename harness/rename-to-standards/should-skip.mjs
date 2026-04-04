// Generated from ../scripts/rename-to-standards.mjs:76

import { normalize } from "./normalize.mjs";

export const shouldSkip = (filePath) => {
  const normalized = normalize(filePath);
  return (
    normalized.includes("/node_modules/") ||
    normalized.includes("/.git/") ||
    normalized.includes("/dist/") ||
    normalized.includes("/coverage/") ||
    normalized.includes("/src/i18n/locales/") ||
    normalized.includes("/src/i18n/static/") ||
    normalized.includes("/src/content/generated/")
  );
};
