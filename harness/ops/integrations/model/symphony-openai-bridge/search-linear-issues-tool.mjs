// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1288

import { getLinearIndexStats, searchLinearIssues } from "../../../lib/search/linear-search.mjs";

export async function searchLinearIssuesTool({ query, limit = 5 }) {
  try {
    const results = await searchLinearIssues(query, limit);
    return {
      query,
      count: results.length,
      results,
      index: getLinearIndexStats(),
    };
  } catch (err) {
    return {
      query,
      count: 0,
      results: [],
      error: err?.message || String(err),
      index: getLinearIndexStats(),
    };
  }
}
