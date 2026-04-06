# ANQR Latency Report

## 1. Directory Overview

This directory contains the latency reporting module for the ANQR (Agentic Number Query Runner)
harness. It provides task latency metrics collection, classification, and reporting capabilities
with optional Discord alerts for performance degradation or baseline exceedance. It currently
contains 10 files and 0 subdirectories.

## 2. File Summaries

### Files

- **acceptable-ms.mjs** - Defines the acceptable latency threshold (30 minutes = 1,800,000ms). Tasks completing within this time but exceeding target are classified as "acceptable".
- **classify-latency.mjs** - Classifies latency performance based on the provided thresholds: "excellent" if <= TARGET_MS, "acceptable" if <= ACCEPTABLE_MS, "degraded" otherwise.
- **format-duration.mjs** - Formats milliseconds into a human-readable string in the format "Xm Ys" (e.g., "5m 30s"). Returns "N/A" for null/undefined values.
- **generate-report.mjs** - Main report generation logic. Fetches latency metrics from symphony-state, calculates baseline deviation, classifies performance, and outputs a JSON report. Optionally sends Discord alerts when baseline exceeds 50% or classification is "degraded".
- **get-latency-color.mjs** - Returns color codes for Discord embeds based on latency classification: green (0x00ff00) for "excellent", orange (0xffa500) for "acceptable", red (0xff0000) for "degraded", and gray (0x808080) for unknown.
- **index.mjs** - Generated facade index that exports all public API members including TARGET_MS, ACCEPTABLE_MS, formatDuration, classifyLatency, getLatencyColor, generateReport, and main.
- **logger.mjs** - Shared logger module that imports and re-exports the logger from the lib directory.
- **main.mjs** - CLI entry point. Parses command-line arguments for the `--alert` flag and calls generateReport. Exits with code 1 if an alert was triggered, 0 otherwise.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function.
- **target-ms.mjs** - Defines the target latency threshold (10 minutes = 600,000ms). Tasks completing within this time are classified as "excellent".

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/orchestration/latency-report/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
