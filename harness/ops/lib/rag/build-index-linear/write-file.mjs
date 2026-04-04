import { randomUUID } from "node:crypto";
import { rename, unlink, writeFile as fsWriteFile } from "node:fs/promises";

export async function writeFile(path, content, encoding = "utf-8") {
  const tmpPath = `${path}.${randomUUID()}.tmp`;
  try {
    await fsWriteFile(tmpPath, content, encoding);
    await rename(tmpPath, path);
  } catch (err) {
    try {
      await unlink(tmpPath);
    } catch {
      // ignore cleanup failures
    }
    throw err;
  }
}
