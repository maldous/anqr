import { SCOPE_RULES } from "./scope-rules.mjs";

export function inferCommitScope(changedFiles) {
  const counts = {};
  for (const file of changedFiles) {
    for (const rule of SCOPE_RULES) {
      if (rule.pattern.test(file)) {
        counts[rule.scope] = (counts[rule.scope] || 0) + 1;
        break;
      }
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "architecture";
}
