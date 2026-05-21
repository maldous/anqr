import { createIssue, STATES } from "../../linear/linear-client.mjs";

export async function createLinearIssueTool({ title, description, priority = 3 }) {
  try {
    const issue = await createIssue({
      title,
      description: description || "",
      priority,
      stateId: STATES.todo,
    });
    return {
      ok: true,
      identifier: issue.identifier,
      title: issue.title,
      url: `https://linear.app/anqr/issue/${issue.identifier}`,
    };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}
