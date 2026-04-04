import fs from "node:fs";

import { detectSuggestion } from "./detect-suggestion.mjs";

export const buildPlan = (root, filePaths) => {
  const plan = [];
  for (const filePath of filePaths) {
    const text = fs.readFileSync(filePath, "utf8");
    const suggestion = detectSuggestion(root, filePath, text);
    if (suggestion) plan.push(suggestion);
  }
  return plan.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
};
