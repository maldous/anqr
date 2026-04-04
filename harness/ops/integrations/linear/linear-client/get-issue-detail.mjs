// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:208

import { query } from "./query.mjs";

export async function getIssueDetail(identifier) {
  const result = await query(
    `query($id: String!) {
      issue(id: $id) {
        id identifier title description priority estimate
        state { name }
        labels { nodes { id name } }
        comments { nodes { id body createdAt } }
        createdAt updatedAt
      }
    }`,
    { id: identifier },
  );
  return result.issue || null;
}
