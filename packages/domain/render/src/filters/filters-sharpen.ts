/**
 * QR Generator Sharpen Filters
 * Re-exports from overlay module (canonical source)
 */

import { createLogger } from "@/domain/logging";

const _log = createLogger("GENERATE");

export { sharpen as applySharpen } from "../overlay/overlay-filters";
