export function classifyBucket(state, summary) {
  if (state === "dirty_owned" || state === "dirty_orphaned") return "dirty";
  if (summary[state] === undefined) return "unknown";
  return state;
}
