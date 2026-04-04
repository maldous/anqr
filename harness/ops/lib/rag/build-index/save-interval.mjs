// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:36

import { toPositiveInt } from "./to-positive-int.mjs";

export const SAVE_INTERVAL = toPositiveInt(process.env.RAG_BUILD_SAVE_INTERVAL, 25);
