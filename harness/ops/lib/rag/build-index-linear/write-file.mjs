export async function writeFile(path, content, encoding) {
  const { writeFile: fsWriteFile } = await import("node:fs/promises");
  await fsWriteFile(path, content, encoding);
}
