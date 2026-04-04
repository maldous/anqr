export function determinePriority(impactLevel) {
  const impact = impactLevel?.toLowerCase();

  switch (impact) {
    case "critical":
    case "urgent":
      return 1; // Urgent
    case "high":
      return 2; // High
    case "normal":
      return 3; // Normal
    case "low":
      return 4; // Low
    default:
      return 3; // Default to normal
  }
}
