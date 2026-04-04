import { LINEAR_WORKSPACE } from "./linear-workspace.mjs";

export function linearIssueUrl(identifier) {
  return `https://linear.app/${LINEAR_WORKSPACE}/issue/${identifier}`;
}
