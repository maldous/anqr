import { sendRequest } from "./send-request.mjs";
import { extractToolsList } from "./extract-tools-list.mjs";
import { setToolRegistry, toolRegistry } from "./tool-registry.mjs";
import { logDebug, logWarn } from "./logger.mjs";

function normalizeName(name) {
  return String(name || "").trim().toLowerCase();
}

function pickTool(tools, preferredNames, fallbackPattern) {
  for (const preferredName of preferredNames) {
    const match = tools.find((tool) => normalizeName(tool.name) === normalizeName(preferredName));
    if (match) return match;
  }
  return tools.find((tool) => fallbackPattern.test(normalizeName(tool.name))) || null;
}

export async function refreshToolRegistry(options = {}) {
  const force = Boolean(options.force);
  const timeoutMs = options.timeoutMs;

  if (!force && toolRegistry) {
    return toolRegistry;
  }

  const result = await sendRequest("tools/list", {}, timeoutMs);
  const tools = extractToolsList(result);

  if (!Array.isArray(tools) || tools.length === 0) {
    throw new Error("tools/list returned no tools");
  }

  const resolveTool = pickTool(tools, ["resolve-library-id"], /resolve.*library/);
  const docsTool = pickTool(tools, ["get-library-docs", "query-docs"], /(get|query).*docs/);

  if (!resolveTool || !docsTool) {
    logWarn("Context7 tool registry did not expose the expected tool names", {
      tools: tools.map((tool) => tool.name),
    });
  } else {
    logDebug("Context7 tool registry refreshed", {
      resolveTool: resolveTool.name,
      docsTool: docsTool.name,
    });
  }

  const registry = {
    loadedAt: Date.now(),
    tools,
    byName: new Map(tools.map((tool) => [tool.name, tool])),
    resolveTool,
    docsTool,
  };

  setToolRegistry(registry);
  return registry;
}
