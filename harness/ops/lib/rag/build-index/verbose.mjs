// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:40

import { isTruthy } from "./is-truthy.mjs";

export const VERBOSE =
  isTruthy(process.env.RAG_BUILD_VERBOSE) || process.argv.includes("--verbose");
