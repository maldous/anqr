/**
 * QR Content Type Detection
 * Re-exports from the canonical content module
 */

import { createLogger } from "../../../../observability/logging/src";

const _log = createLogger("ANALYZER");

export { detectContentType } from "./analyzer-content";
export type { ContentType, ContentTypeDetails } from "@/modules/qr-analyzer/types";
