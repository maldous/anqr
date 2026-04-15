import { API_KEY } from "./api-key.mjs";
import { query } from "./query.mjs";
import { TEAM_ID } from "./team-id.mjs";

export async function fetchPage(after = null) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: API_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { teamId: TEAM_ID, after },
    }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data.issues;
}
