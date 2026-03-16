/**
 * Animation Types
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("ANIMATION");
export type { AnimationFrame } from "./animation-frame";
export type { AnimationOptions } from "./animation-options";
export type { AnimationPattern } from "./animation-pattern";
export type { AnimationState } from "./animation.types";
export type { GifCompositor } from "./gif-compositor.types";
