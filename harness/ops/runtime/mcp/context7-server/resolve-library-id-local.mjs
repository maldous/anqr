import { callLocalTool } from "./call-local-tool.mjs";
import { extractLibraryId } from "./extract-library-id.mjs";
import { buildResolveArguments } from "./build-resolve-arguments.mjs";

export async function resolveLibraryIdLocal(registry, libraryTitle, topic) {
  if (!registry?.resolveTool?.name) return null;

  const resolveArgs = buildResolveArguments(registry.resolveTool, libraryTitle, topic);
  const resolveResult = await callLocalTool(registry.resolveTool.name, resolveArgs);
  return extractLibraryId(resolveResult, { preferredText: libraryTitle });
}
