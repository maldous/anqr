import { getIssueState } from "../../../symphony-state.mjs";

export function hasActiveCooldown(identifier) {
  const state = getIssueState(identifier);
  return Boolean(state?.cooldown_until && new Date(state.cooldown_until) > new Date());
}
