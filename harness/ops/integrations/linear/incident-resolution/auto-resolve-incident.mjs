import { updateIssue, addComment } from "../linear-client.mjs";
import { STATES } from "../linear-client.mjs";
import { logInfo } from "./logger.mjs";

export async function autoResolveIncident(issue, resolution) {
  const { service, healthData } = resolution;

  // Add resolution comment
  const commentLines = [
    "## Auto-Resolution",
    "",
    `**Service:** ${service}`,
    `**Health Status:** ${healthData?.status || "ok"}`,
    `**Resolved At:** ${new Date().toISOString()}`,
    "",
    "Service has been healthy for >1 hour since incident creation.",
    "",
    "If the issue recurs, a new incident will be created automatically.",
  ];

  if (healthData) {
    commentLines.push("");
    commentLines.push("### Health Check Data");
    commentLines.push("```json");
    commentLines.push(JSON.stringify(healthData, null, 2));
    commentLines.push("```");
  }

  await addComment(issue.id, commentLines.join("\n"));

  // Move to Done
  await updateIssue(issue.id, { stateId: STATES.done });

  logInfo(`[incident-resolver] ✅ Auto-resolved ${issue.identifier}`);
}
