#!/usr/bin/env node

import { resetRetryState, clearCooldown } from "../symphony-state.mjs";
import { listIssuesByState } from "../linear-client.mjs";

(async () => {
  const todos = await listIssuesByState(["Todo"]);
  let resetCount = 0;
  for (const issue of todos) {
    resetRetryState(issue.identifier);
    clearCooldown(issue.identifier);
    resetCount++;
    console.log("Reset:", issue.identifier, issue.title.slice(0, 50));
  }
  console.log("\nTotal reset:", resetCount);
})();
