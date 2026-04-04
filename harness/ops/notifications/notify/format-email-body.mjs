// Generated from ../../../scripts/ops/notifications/notify.mjs:69

export function formatEmailBody(report) {
  const { profile, timestamp, total_duration_ms, summary, checks } = report;
  const failures = checks.filter((c) => !c.pass);
  const passes = checks.filter((c) => c.pass);
  const timing = (total_duration_ms / 1000).toFixed(1);

  const lines = [
    `Nightly Harness Report`,
    `======================`,
    "",
    `Profile:  ${profile}`,
    `Time:     ${timestamp}`,
    `Duration: ${timing}s`,
    `Result:   ${summary.passed}/${summary.total} passed, ${summary.failed} failed`,
    "",
  ];

  if (failures.length > 0) {
    lines.push("FAILURES:", "");
    for (const check of failures) {
      const t =
        check.duration_ms > 1000
          ? `${(check.duration_ms / 1000).toFixed(1)}s`
          : `${check.duration_ms}ms`;
      lines.push(`  ❌ ${check.name} (${t}): ${check.detail.split("\n")[0]}`);
    }
    lines.push("");
  }

  if (passes.length > 0) {
    lines.push("PASSED:", "");
    for (const check of passes) {
      lines.push(`  ✅ ${check.name}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
