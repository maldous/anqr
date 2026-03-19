export function createMcpImageResult(outputBuffer: Buffer, contentType: string) {
  if (contentType === "image/svg+xml") {
    return {
      content: [{ type: "text" as const, text: outputBuffer.toString("utf-8") }],
    };
  }

  return {
    content: [
      {
        type: "image" as const,
        data: outputBuffer.toString("base64"),
        mimeType: contentType,
      },
    ],
  };
}
