#!/usr/bin/env node

/**
 * codebuff-sdk-runner.mjs — Shared constants for Codebuff integration
 *
 * DEPRECATED: The direct SDK runner is deprecated. All Codebuff calls now
 * go through the HTTP bridge at http://127.0.0.1:4318 (codebuff-openai-bridge.mjs).
 *
 * This module now only exports shared path constants used by other parts of the harness.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, "../../../../");
export const REPORTS_DIR = path.join(PROJECT_ROOT, "reports", "codebuff");
