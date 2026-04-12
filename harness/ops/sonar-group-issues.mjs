#!/usr/bin/env node
import { readFileSync } from "fs";
import { createIssue, STATES, LABELS } from "./integrations/linear/linear-client.mjs";

const SONAR_REPORT = "sonar-report.json";

async function main() {
  console.log("[sonar-group] Loading sonar-report.json...");
  const report = JSON.parse(readFileSync(SONAR_REPORT, "utf-8"));

  const issues = report.issues.all;
  console.log(`[sonar-group] Total issues: ${issues.length}`);

  // Group by rule
  const byRule = {};
  for (const issue of issues) {
    const rule = issue.rule;
    if (!byRule[rule]) byRule[rule] = [];
    byRule[rule].push(issue);
  }

  const rules = Object.entries(byRule).sort((a, b) => b[1].length - a[1].length);
  console.log(`[sonar-group] Unique rules: ${rules.length}`);

  // Create or find existing issues for each rule
  for (const [rule, ruleIssues] of rules) {
    const count = ruleIssues.length;
    const sample = ruleIssues[0];
    const title = `Sonar: ${rule} (${count})`;

    // Extract file paths for description
    const files = [...new Set(ruleIssues.map((i) => i.component.split(":")[1]))].slice(0, 15);
    const moreFiles =
      files.length < [...new Set(ruleIssues.map((i) => i.component))].size ? " ..." : "";

    // Create issue
    const issue = await createIssue({
      title,
      description: [
        `**Rule:** ${rule}`,
        `**Count:** ${count}`,
        "",
        `**Sample message:** ${sample.message}`,
        "",
        `**Affected files (${files.length}):`,
        ...files.map((f) => `- ${f}`),
        moreFiles,
        "",
        `> ${sample.message}`,
        "",
        `SonarQube: http://localhost:9000/rules?rule_keys=${rule}`,
      ].join("\n"),
      priority: 2,
      labelIds: [LABELS.harness, LABELS.hygiene],
      stateId: STATES.todo,
    });

    console.log(`[sonar-group] Created ${issue.identifier}: ${title}`);
  }

  console.log(`[sonar-group] Done - created ${rules.length} issues`);
}

main().catch((err) => {
  console.error("[sonar-group] Error:", err.message);
  process.exit(1);
});
