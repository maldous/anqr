// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:48

import { LINEAR_API } from "./linear-api.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { getApiKey } from "./get-api-key.mjs";

export async function query(graphql, variables) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getApiKey(),
      },
      body: JSON.stringify({ query: graphql, variables }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.errors) throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
    return data.data;
  } finally {
    clearTimeout(timer);
  }
}
