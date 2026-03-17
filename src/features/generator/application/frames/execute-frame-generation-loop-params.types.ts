import type { AnimationFrame } from "@/modules/animation";
import type { YieldController } from "@/features/generator/application/generation/generation-class-yieldcontroller";
import type { FramePostProcessContext } from "./frame-post-process-context.types";
import type { FrameRenderContext } from "./frame-render-context.types";

export interface ExecuteFrameGenerationLoopParams<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>
  extends
    Omit<FrameRenderContext, "frame" | "frameIdx" | "framesToProcessLength">,
    FramePostProcessContext<W> {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  framesToProcess: AnimationFrame[];

  t: (...args: any[]) => any;
  updateGenerationProgress: (stage: string, percent: number) => void;
  yieldCtrl: YieldController;
}
