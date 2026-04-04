import { TITLE_PREFIX } from "../../symphony-config.mjs";

export function buildIssueTitle(checkName) {
  return `${TITLE_PREFIX}: ${checkName} failure`;
}
