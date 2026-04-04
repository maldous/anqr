import { CHECK_METADATA } from "./check-metadata.mjs";

export function buildIssueBody(check, report) {
  const lines = [
    `## ${CHECK_METADATA[check.name]?.summary || check.name}`,
    "",
    `**Check:** \`${check.name}\``,
    `**Profile:** ${report.profile}`,
    `**Detected:** ${report.timestamp}`,
    `**Duration:** ${check.duration_ms}ms`,
    "",
    "### Detail",
    "",
    "```",
    check.detail,
    "```",
    "",
    "---",
    "*Auto-created by linear-guardian.mjs*",
  ];
  return lines.join("\n");
}
