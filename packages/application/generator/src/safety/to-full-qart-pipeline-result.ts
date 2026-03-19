import type { FullQArtPipelineResult, QArtModule } from "../shared/qart.types";

export function toFullQArtPipelineResult(
  result: Awaited<ReturnType<QArtModule["generateFullQArtOptimal"]>>,
): FullQArtPipelineResult {
  return {
    ...result,
    encodedData:
      typeof result.encodedData === "string"
        ? new TextEncoder().encode(result.encodedData)
        : result.encodedData,
  };
}
