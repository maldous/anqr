import type { ShareConfig } from "@/modules/share-links";
import { useQRStore } from "@/store/qr-store";
import type { StoreState } from "@/features/generator/model/mobile-split";

export function applyRenderEyeAndFrameStyles(
  params: Partial<ShareConfig>,
  store: StoreState,
): void {
  if (params.eyeOuterStyle)
    useQRStore.setState((s) => ({
      render: {
        ...s.render,
        eyeOuterStyle: params.eyeOuterStyle as "square" | "rounded" | "circle",
      },
    }));
  if (params.eyeInnerStyle)
    useQRStore.setState((s) => ({
      render: {
        ...s.render,
        eyeInnerStyle: params.eyeInnerStyle as "square" | "rounded" | "circle",
      },
    }));
  if (params.eyeScale !== undefined)
    useQRStore.setState((s) => ({ render: { ...s.render, eyeScale: params.eyeScale! } }));
  if (params.frameStyle)
    store.setRenderFrameStyle(params.frameStyle as "none" | "rounded_frame" | "sticker" | "tag");
  if (params.frameText) store.setRenderFrameText(params.frameText);
  if (params.dotRotation !== undefined)
    useQRStore.setState((s) => ({
      render: { ...s.render, dotRotationDeg: params.dotRotation! },
    }));
  if (params.crispEdges === false)
    useQRStore.setState((s) => ({ render: { ...s.render, crispEdges: false } }));
  if (params.pixelSnap)
    useQRStore.setState((s) => ({
      render: { ...s.render, pixelSnap: params.pixelSnap as "floor" | "round" | "ceil" },
    }));
}
