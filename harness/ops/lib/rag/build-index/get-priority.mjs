import { PRIORITY_RULES } from "./priority-rules.mjs";

export function getPriority(relPath) {
  for (const [pattern, priority] of PRIORITY_RULES) {
    if (pattern.test(relPath)) return priority;
  }
  return 50;
}
