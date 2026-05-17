#!/usr/bin/env node
import { createIssue } from "./linear-client/create-issue.mjs";
import { TEAM_ID } from "./linear-client/team-id.mjs";

const testTitle = process.argv[2] || "Test: Add blank line to README.md";

const issue = await createIssue({
  teamId: TEAM_ID,
  title: testTitle,
  description: "Add a blank line at the end of the project README.md file to fix the missing trailing newline.",
  priority: 1,
  stateId: null, // Defaults to Todo
});

console.log(`Created ${issue.identifier}: ${issue.title}`);
console.log(JSON.stringify(issue, null, 2));
