import { logInfo } from "./logger.mjs";

export async function proposeWriteFileTool({ path: filePath, instructions, content }) {
  logInfo(`📝 Proposed write: ${filePath} - ${instructions}`);
  return {
    success: true,
    path: filePath,
    instructions,
    contentLength: content.length,
    proposed: true,
  };
}
