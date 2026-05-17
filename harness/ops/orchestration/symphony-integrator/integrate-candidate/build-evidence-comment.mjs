import { formatPushStatus } from "./build-evidence-comment/format-push-status.mjs";
import { formatValidationStatus } from "./build-evidence-comment/format-validation-status.mjs";

export function buildEvidenceComment({
  issueIdentifier,
  finalization,
  pushedMainSha,
  changedFiles,
  diffStat,
  evidence,
}) {
  const validation = evidence?.validation || null;
  const push = evidence?.push || null;
  const docsUpdated = changedFiles.some((f) => /(?:^docs\/|README\.md$)/.test(f));
  const verificationResults = [
    ["typecheck", validation?.typecheckPassed],
    ["tests", validation?.testsPassed],
    ["lint", validation?.lintPassed],
  ];

  return [
    `✅ **Integrated to main** — evidence record`,
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Issue | ${issueIdentifier} |`,
    `| Worktree | ${finalization.worktreeId || evidence?.worktreeSelection?.worktreeId || "unknown"} |`,
    `| Actor | symphony-integrator |`,
    `| Source commit | \`${(finalization.headSha || "unknown").slice(0, 8)}\` |`,
    `| Integration commit | \`${pushedMainSha.slice(0, 8)}\` |`,
    `| Branch | \`${finalization.branch || "unknown"}\` |`,
    `| Files changed | ${changedFiles.length} |`,
    `| Docs updated | ${docsUpdated ? "yes" : "no"} |`,
    `| Push status | ${formatPushStatus(push)} |`,
    `| Integration method | cherry-pick |`,
    `| Timestamp | ${new Date().toISOString()} |`,
    "",
    `### Verification commands run`,
    `- npm run typecheck`,
    `- npm run test`,
    `- npm run lint`,
    "",
    `### Verification results`,
    ...verificationResults.map(
      ([name, value]) =>
        `- ${name}: ${formatValidationStatus(value)}`,
    ),
    validation?.errors?.length
      ? `- errors: ${validation.errors.join(", ")}`
      : `- errors: none recorded`,
    "",
    `### Changed files`,
    ...changedFiles.slice(0, 20).map((f) => `- \`${f}\``),
    ...(changedFiles.length > 20 ? [`- ... and ${changedFiles.length - 20} more`] : []),
    "",
    `### Diff summary`,
    "```",
    diffStat || "(no diff stat)",
    "```",
  ].join("\n");
}
