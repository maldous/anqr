/**
 * QR Generator Edge Detection Filters
 * Re-exports from overlay module (canonical source)
 */

import { createLogger } from "../../../infra/logging/logger";

const _log = createLogger("GENERATE");

export { cannyEdge as applyCannyEdge, sobelEdge as applySobelEdge } from "../../../modules/overlay";
