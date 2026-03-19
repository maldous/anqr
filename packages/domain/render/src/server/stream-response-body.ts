export async function streamResponseBody(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
): Promise<Buffer | null> {
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const combinedBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combinedBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return Buffer.from(combinedBytes);
}
