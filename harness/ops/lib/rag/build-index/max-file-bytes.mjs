// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:38

import { toPositiveInt } from "./to-positive-int.mjs";

export const MAX_FILE_BYTES = toPositiveInt(process.env.RAG_BUILD_MAX_FILE_BYTES, 256 * 1024);
