import type { ShareConfig } from "@/contracts/share";
import type { UrlImportStore } from "./store-contract.types";

export function applyRenderEyeAndFrameStyles(
  params: Partial<ShareConfig>,
  store: UrlImportStore,
): void {
  if (params.eyeOuterStyle)
    store.patchState((s) => ({
      render: {
        ...s.render,
        eyeOuterStyle: params.eyeOuterStyle as "square" | "rounded" | "circle",
      },
    }));
  if (params.eyeInnerStyle)
    store.patchState((s) => ({
      render: {
        ...s.render,
        eyeInnerStyle: params.eyeInnerStyle as "square" | "rounded" | "circle",
      },
    }));
  if (params.eyeScale !== undefined)
    store.patchState((s) => ({ render: { ...s.render, eyeScale: params.eyeScale! } }));
  if (params.frameStyle)
    store.setRenderFrameStyle(params.frameStyle as "none" | "rounded_frame" | "sticker" | "tag");
  if (params.frameText) store.setRenderFrameText(params.frameText);
  if (params.dotRotation !== undefined)
    store.patchState((s) => ({
      render: { ...s.render, dotRotationDeg: params.dotRotation! },
    }));
  if (params.crispEdges === false)
    store.patchState((s) => ({ render: { ...s.render, crispEdges: false } }));
  if (params.pixelSnap)
    store.patchState((s) => ({
      render: { ...s.render, pixelSnap: params.pixelSnap as "floor" | "round" | "ceil" },
    }));
}
