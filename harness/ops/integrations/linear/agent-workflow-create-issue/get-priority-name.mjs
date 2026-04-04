export function getPriorityName(priority) {
  const priorityNames = ["None", "Urgent", "High", "Normal", "Low"];
  return priorityNames[priority] || "Unknown";
}
