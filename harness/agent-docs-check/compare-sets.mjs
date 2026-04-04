// Generated from ../scripts/agent-docs-check.mjs:67

import { errors } from "./errors.mjs";

export function compareSets(source, sourceLabel, target, targetLabel) {
  for (const agent of source) {
    if (!target.has(agent)) {
      errors.push(`${targetLabel}: missing \`${agent}\` (present in ${sourceLabel})`);
    }
  }
  for (const agent of target) {
    if (!source.has(agent)) {
      errors.push(`${targetLabel}: has extra \`${agent}\` (not in ${sourceLabel})`);
    }
  }
}
