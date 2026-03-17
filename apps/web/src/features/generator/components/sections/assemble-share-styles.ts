import type { StoreState } from "./share-config-store.types";
import { omitWhenEqual, undefinedIfEqual, undefinedIfFalsy } from "./share-config-field-helpers";
import { buildShareStylesContrastFields } from "./build-share-styles-contrast-fields";

export function assembleShareStyles(render: StoreState["render"]) {
  return {
    style: undefinedIfEqual(render.moduleStyle, "square"),
    finder: undefinedIfEqual(render.finderStyle, "square"),
    alignmentStyle: undefinedIfEqual(render.alignmentStyle, "match_finder"),
    timingStyle: undefinedIfEqual(render.timingStyle, "match_module"),
    moduleGap: undefinedIfEqual(render.moduleGapPercent, 0),
    gapMode: undefinedIfEqual(render.gapMode, "none"),
    cornerRadius: undefinedIfEqual(render.cornerRadius, 0),
    gradientType: undefinedIfEqual(render.gradient.type, "none"),
    eyeOuterStyle: undefinedIfEqual(render.eyeOuterStyle, "square"),
    eyeInnerStyle: undefinedIfEqual(render.eyeInnerStyle, "square"),
    eyeScale: undefinedIfEqual(render.eyeScale, 100),
    frameStyle: undefinedIfEqual(render.frameStyle, "none"),
    frameText: undefinedIfFalsy(render.frameText),
    dotRotation: undefinedIfEqual(render.dotRotationDeg, 0),
    crispEdges: omitWhenEqual(render.crispEdges, true),
    pixelSnap: undefinedIfEqual(render.pixelSnap, "floor"),
    perModuleColorMode: undefinedIfEqual(render.perModuleColorMode, "solid"),
    ...buildShareStylesContrastFields(render),
  };
}
