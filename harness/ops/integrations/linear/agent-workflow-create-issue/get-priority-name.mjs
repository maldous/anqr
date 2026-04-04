// Generated from ../../../../scripts/ops/integrations/linear/agent-workflow-create-issue.mjs:191

export function getPriorityName(priority) {
  const priorityNames = ["None", "Urgent", "High", "Normal", "Low"];
  return priorityNames[priority] || "Unknown";
}
