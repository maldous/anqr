export function extractPlanComment(issue) {
  return (issue?.comments?.nodes || [])
    .filter((c) => c.body.startsWith("AI Hint:") && c.body.includes("ACCEPTANCE CRITERIA"))
    .map((c) => c.body)
    .join("\n\n") || null;
}
