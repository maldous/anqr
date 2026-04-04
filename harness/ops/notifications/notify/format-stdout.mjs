export function formatStdout(report) {
  const { profile, timestamp, total_duration_ms, summary, checks } = report;
  const timing = (total_duration_ms / 1000).toFixed(1);

  const lines = [
    `[notify] Harness report summary`,
    `[notify] Profile: ${profile} | Time: ${timestamp} | Duration: ${timing}s`,
    `[notify] Result: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`,
    "",
  ];

  for (const check of checks) {
    const icon = check.pass ? "✅" : "❌";
    const t =
      check.duration_ms > 1000
        ? `${(check.duration_ms / 1000).toFixed(1)}s`
        : `${check.duration_ms}ms`;
    lines.push(`  ${icon} ${check.name} (${t})`);
  }

  return lines.join("\n");
}
