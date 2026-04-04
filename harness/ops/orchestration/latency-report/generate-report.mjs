// Generated from ../../../scripts/ops/orchestration/latency-report.mjs:57

import { getLatencyMetrics, checkLatencyBaseline } from "../../core/symphony-state.mjs";
import { sendDiscordEmbed } from "../../integrations/notifications/openclaw-discord.mjs";

import { ACCEPTABLE_MS } from "./acceptable-ms.mjs";
import { TARGET_MS } from "./target-ms.mjs";
import { classifyLatency } from "./classify-latency.mjs";
import { formatDuration } from "./format-duration.mjs";
import { getLatencyColor } from "./get-latency-color.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function generateReport({ sendAlert = false } = {}) {
  logInfo("[latency-report] Generating task latency metrics...");

  const metrics = getLatencyMetrics();

  if (metrics.count === 0) {
    logWarn("[latency-report] No completed tasks found - no metrics to report");
    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          count: 0,
          message: "No completed tasks",
        },
        null,
        2,
      ),
    );
    return { metrics, baseline: null, alert: false };
  }

  const baseline = checkLatencyBaseline(metrics.averageMs);
  const classification = classifyLatency(metrics.averageMs);

  const report = {
    timestamp: new Date().toISOString(),
    count: metrics.count,
    averageMs: metrics.averageMs,
    averageDuration: formatDuration(metrics.averageMs),
    medianMs: metrics.medianMs,
    medianDuration: formatDuration(metrics.medianMs),
    p95Ms: metrics.p95Ms,
    p95Duration: formatDuration(metrics.p95Ms),
    minMs: metrics.minMs,
    minDuration: formatDuration(metrics.minMs),
    maxMs: metrics.maxMs,
    maxDuration: formatDuration(metrics.maxMs),
    classification,
    target: {
      ms: TARGET_MS,
      duration: formatDuration(TARGET_MS),
      met: metrics.averageMs <= TARGET_MS,
    },
    acceptable: {
      ms: ACCEPTABLE_MS,
      duration: formatDuration(ACCEPTABLE_MS),
      met: metrics.averageMs <= ACCEPTABLE_MS,
    },
    baseline: baseline.baseline
      ? {
          ms: baseline.baseline,
          duration: formatDuration(baseline.baseline),
          increasePercent: baseline.increase,
          alert: baseline.alert,
        }
      : null,
  };

  console.log(JSON.stringify(report, null, 2));

  // Send alert if requested and conditions met
  if (sendAlert && (baseline.alert || classification === "degraded")) {
    logInfo("[latency-report] Sending latency alert...");

    const fields = [
      { name: "Tasks Completed", value: String(metrics.count), inline: true },
      { name: "Average Latency", value: formatDuration(metrics.averageMs), inline: true },
      { name: "P95 Latency", value: formatDuration(metrics.p95Ms), inline: true },
      { name: "Classification", value: classification.toUpperCase(), inline: true },
      { name: "Target Met", value: report.target.met ? "✅" : "❌", inline: true },
      { name: "Acceptable", value: report.acceptable.met ? "✅" : "❌", inline: true },
    ];

    if (baseline.baseline) {
      fields.push({
        name: "Baseline Change",
        value: `${baseline.increase > 0 ? "+" : ""}${baseline.increase}%`,
        inline: true,
      });
    }

    const title = baseline.alert
      ? "⚠️ Pipeline Latency Alert: >50% Increase"
      : "⚠️ Pipeline Latency Alert: Degraded Performance";

    const description = baseline.alert
      ? `Average task latency increased ${baseline.increase}% from baseline (${formatDuration(baseline.baseline)} → ${formatDuration(metrics.averageMs)})`
      : `Average task latency (${formatDuration(metrics.averageMs)}) exceeds acceptable threshold (${formatDuration(ACCEPTABLE_MS)})`;

    await sendDiscordEmbed({
      title,
      description,
      color: getLatencyColor(classification),
      fields,
    }).catch((err) => {
      logError(`[latency-report] Discord notification failed: ${err.message}`);
    });
  }

  return { metrics, baseline, alert: baseline.alert || classification === "degraded" };
}
