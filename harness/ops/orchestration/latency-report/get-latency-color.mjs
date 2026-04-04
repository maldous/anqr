// Generated from ../../../scripts/ops/orchestration/latency-report.mjs:44

export function getLatencyColor(classification) {
  switch (classification) {
    case "excellent":
      return 0x00ff00; // Green
    case "acceptable":
      return 0xffa500; // Orange
    case "degraded":
      return 0xff0000; // Red
    default:
      return 0x808080; // Gray
  }
}
