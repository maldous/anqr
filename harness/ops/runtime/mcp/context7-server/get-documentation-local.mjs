import { callLocalTool } from "./call-local-tool.mjs";
import { extractDocumentation } from "./extract-documentation.mjs";
import { buildDocsArguments } from "./build-docs-arguments.mjs";

export async function getDocumentationLocal(registry, libraryId, libraryTitle, topic, maxTokens) {
  if (!registry?.docsTool?.name) return null;

  const docsArgs = buildDocsArguments(registry.docsTool, libraryId, libraryTitle, topic, maxTokens);
  const docsResult = await callLocalTool(registry.docsTool.name, docsArgs);
  return extractDocumentation(docsResult);
}
