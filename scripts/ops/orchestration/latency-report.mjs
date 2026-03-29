#!/usr/bin/env node

/**
 * latency-report.mjs — Pipeline Task Latency Monitoring
 *
 * Tracks Symphony runner task latency and alerts on degradation.
 *
 * Requirements (ANQ-321):
 * - Target: ≤10min per task
 * - Acceptable: ≤30min per task
 * - Alert: >50% increase from baseline
 * - Track: average latency per run
 *
 * Usage:
 *   node scripts/ops/orchestration/latency-report.mjs [--alert]
 *
 * Flags:
 *   --alert   Send Discord notification if latency exceeds threshold
 */

import { getLatencyMetrics, checkLatencyBaseline } from "../core/symphony-state.mjs";
import { sendDiscordEmbed } from "../integrations/notifications/discord-webhook.mjs";
import { createLogger } from "../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

const TARGET_MS = 10 * 60 * 1000; // 10 minutes
const ACCEPTABLE_MS = 30 * 60 * 1000; // 30 minutes

function formatDuration(ms) {
  if (!ms) return "N/A";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function classifyLatency(ms) {
  if (!ms) return "unknown";
  if (ms <= TARGET_MS) return "excellent";
  if (ms <= ACCEPTABLE_MS) return "acceptable";
  return "degraded";
}

function getLatencyColor(classification) {
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

async function generateReport({ sendAlert = false } = {}) {
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

async function main() {
  const args = new Set(process.argv.slice(2));
  const sendAlert = args.has("--alert");

  try {
    const result = await generateReport({ sendAlert });
    process.exit(result.alert ? 1 : 0);
  } catch (err) {
    logError(`[latency-report] Fatal error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

await main();
