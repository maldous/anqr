import type { CanvasFactory } from "@/domain/render/canvas";

export type RenderToolOptions<TInput, TParams> = {
  name: string;
  description: string;
  shape: Record<string, unknown>;
  toParams: (input: TInput) => TParams;
  render: (
    params: TParams,
    canvasFactory: CanvasFactory,
  ) => Promise<{
    outputBuffer: Buffer;
    contentType: string;
  }>;
  getLogContext: (
    params: TParams,
    extra: { sessionId?: string } | undefined,
  ) => Record<string, unknown>;
  getFailureMessage: (error: unknown) => string;
};
