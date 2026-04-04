// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:96

import { TITLE_PREFIX } from "../../symphony-config.mjs";

export function buildIssueTitle(checkName) {
  return `${TITLE_PREFIX}: ${checkName} failure`;
}
