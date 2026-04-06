# ANQR Latency Report

## 1. Directory Overview

This directory contains the latency reporting module for the ANQR (Agentic Number Query Runner) harness. It provides task latency metrics collection, classification, and reporting capabilities with optional Discord alerts for performance degradation or baseline exceedance.

## 2. File Summaries

### Constants

- **target-ms.mjs** - Defines the target latency threshold (10 minutes = 600,000ms). Tasks completing within this time are classified as "excellent".

- **acceptable-ms.mjs** - Defines the acceptable latency threshold (30 minutes = 1,800,000ms). Tasks completing within this time but exceeding target are classified as "acceptable".

### Utility Functions

- **format-duration.mjs** - Formats milliseconds into a human-readable string in the format "Xm Ys" (e.g., "5m 30s"). Returns "N/A" for null/undefined values.

- **get-latency-color.mjs** - Returns color codes for Discord embeds based on latency classification: green (0x00ff00) for "excellent", orange (0xffa500) for "acceptable", red (0xff0000) for "degraded", and gray (0x808080) for unknown.

- **classify-latency.mjs** - Classifies latency performance based on the provided thresholds: "excellent" if <= TARGET_MS, "acceptable" if <= ACCEPTABLE_MS, "degraded" otherwise.

### Core Implementation

- **generate-report.mjs** - Main report generation logic. Fetches latency metrics from symphony-state, calculates baseline deviation, classifies performance, and outputs a JSON report. Optionally sends Discord alerts when baseline exceeds 50% or classification is "degraded".

- **main.mjs** - CLI entry point. Parses command-line arguments for the `--alert` flag and calls generateReport. Exits with code 1 if an alert was triggered, 0 otherwise.

- **logger.mjs** - Shared logger module that imports and re-exports the logger from the lib directory.

### Facade Module

- **index.mjs** - Generated facade index that exports all public API members including TARGET_MS, ACCEPTABLE_MS, formatDuration, classifyLatency, getLatencyColor, generateReport, and main.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function.

## 3. Overall Directory Function

This directory provides a complete latency monitoring and reporting system for the ANQR harness. The workflow:

1. `main.mjs` serves as the CLI entry point accepting an optional `--alert` flag
2. It calls `generateReport` which fetches metrics from `symphony-state.mjs`
3. The metrics are classified using `classifyLatency` based on TARGET_MS and ACCEPTABLE_MS thresholds
4. Baseline deviation is calculated via `checkLatencyBaseline` - alerts trigger when latency exceeds baseline by >50%
5. A JSON report is printed to stdout with comprehensive metrics (count, average, median, p95, min, max)
6. If `sendAlert` is true and conditions are met, a Discord embed notification is sent

The module integrates with `symphony-state.mjs` for metrics retrieval and `openclaw-discord.mjs` for notifications.

## 4. Usage Instructions

### Running the Latency Report

```bash
# Generate report to stdout
node ops/orchestration/latency-report/main.mjs

# Generate report and send Discord alert if thresholds exceeded
node ops/orchestration/latency-report/main.mjs --alert
```

### Programmatic Usage

```javascript
import { generateReport, TARGET_MS, ACCEPTABLE_MS, classifyLatency, formatDuration } from "./ops/orchestration/latency-report/index.mjs";

// Generate report without alert
const result = await generateReport({ sendAlert: false });
console.log(result.metrics);

// Generate report with potential Discord alert
const resultWithAlert = await generateReport({ sendAlert: true });
```

### Exit Codes

- `0` - Success (no alert triggered or alert sent successfully)
- `1` - Alert condition detected (latency degraded or baseline exceeded)

## 5. Dependencies

### Internal Dependencies

- **../../core/symphony-state.mjs** - Provides `getLatencyMetrics` and `checkLatencyBaseline` functions for metrics retrieval and baseline comparison.

- **../../integrations/notifications/openclaw-discord.mjs** - Provides `sendDiscordEmbed` for sending alert notifications.

- **../../lib/logger.mjs** - Provides the logger factory for this module.

### External Services

- **Discord** - Required for sending alert notifications when the `--alert` flag is used.

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Discord webhook configuration for alert functionality

## 6. Additional Comments

- **Threshold Tuning**: The TARGET_MS (10 min) and ACCEPTABLE_MS (30 min) thresholds can be adjusted based on operational requirements. The target represents the desired performance, while acceptable is the upper bound before triggering degradation alerts.

- **Baseline Monitoring**: The module automatically tracks baseline latency and alerts when current average exceeds the baseline by more than 50%. This helps detect gradual performance degradation over time.

- **Integration Pattern**: This follows the standard ANQR pattern with facade (index.mjs), runtime (runtime.mjs), and implementation modules. The main logic resides in generate-report.mjs with utilities in separate files for maintainability.

- **Alert Conditions**: Alerts are triggered in two scenarios: (1) when average latency exceeds ACCEPTABLE_MS (degraded classification), or (2) when latency exceeds the historical baseline by more than 50% (baseline alert).