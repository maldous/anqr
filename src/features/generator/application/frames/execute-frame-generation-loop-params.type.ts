import type { AnimationFrame } from '@/modules/animation';
import type { YieldController } from '@/features/generator/application/generation/generation-class-yieldcontroller';
import type { FramePostProcessContext } from './frame-post-process-context.type';
import type { FrameRenderContext } from './frame-render-context.type';

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
    Omit<FrameRenderContext, 'frame' | 'frameIdx' | 'framesToProcessLength'>,
    FramePostProcessContext<W> {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  framesToProcess: AnimationFrame[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  updateGenerationProgress: (stage: string, percent: number) => void;
  yieldCtrl: YieldController;
}
