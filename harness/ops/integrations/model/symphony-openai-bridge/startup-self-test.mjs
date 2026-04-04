// Extracted from runtime.mjs: startup self-tests for tool schemas and catch-all proxy.

import { tools } from "./tools.mjs";
import { toolsProxy } from "./tools-proxy.mjs";
import { logDebug, logInfo, logError } from "./logger.mjs";

export async function runStartupSelfTests() {
  const selfTests = [
    // run_file_change_hooks
    { tool: "run_file_change_hooks", name: "files_array", input: { files: ["test.txt"] } },
    { tool: "run_file_change_hooks", name: "files_string", input: { files: "test.txt" } },
    {
      tool: "run_file_change_hooks",
      name: "files_json_array",
      input: { files: '["file1.ts", "file2.ts"]' },
    },
    { tool: "run_file_change_hooks", name: "files_empty_string", input: { files: "" } },
    {
      tool: "run_file_change_hooks",
      name: "files_object_path",
      input: { files: { path: "test.ts" } },
    },

    // read_files
    { tool: "read_files", name: "paths_array", input: { paths: ["package.json"] } },
    { tool: "read_files", name: "paths_string", input: { paths: "package.json" } },
    { tool: "read_files", name: "paths_json_array", input: { paths: '["package.json"]' } },

    // str_replace
    {
      tool: "str_replace",
      name: "replacements_array",
      input: { path: "test.txt", replacements: [{ old: "a", new: "b" }] },
    },
    {
      tool: "str_replace",
      name: "replacements_object",
      input: { path: "test.txt", replacements: { old: "a", new: "b" } },
    },
    {
      tool: "str_replace",
      name: "replacements_json",
      input: { path: "test.txt", replacements: '[{"old":"a","new":"b"}]' },
    },

    // spawn_agents
    { tool: "spawn_agents", name: "agents_array", input: { agents: [{ agent_type: "test" }] } },
    { tool: "spawn_agents", name: "agents_object", input: { agents: { agent_type: "test" } } },
    { tool: "spawn_agents", name: "agents_json", input: { agents: '[{"agent_type":"test"}]' } },

    // read_subtree
    { tool: "read_subtree", name: "paths_array", input: { paths: ["."] } },
    { tool: "read_subtree", name: "paths_string", input: { paths: "." } },
    { tool: "read_subtree", name: "maxTokens_number", input: { maxTokens: 1000 } },
    { tool: "read_subtree", name: "maxTokens_string", input: { maxTokens: "1000" } },

    // run_terminal_command (Codebuff-native alias)
    { tool: "run_terminal_command", name: "basic", input: { command: "echo hello" } },
    { tool: "run_terminal_command", name: "with_cwd", input: { command: "ls", cwd: "." } },
    {
      tool: "run_terminal_command",
      name: "with_timeout_number",
      input: { command: "echo hi", timeout_seconds: 30 },
    },
    {
      tool: "run_terminal_command",
      name: "with_timeout_string",
      input: { command: "echo hi", timeout_seconds: "30" },
    },

    // write_file (Codebuff-native alias)
    { tool: "write_file", name: "basic", input: { path: "test.txt", content: "hello" } },
    {
      tool: "write_file",
      name: "with_instructions",
      input: { path: "test.txt", instructions: "Create a test", content: "hello" },
    },

    // Cross-provider compatibility tools
    { tool: "shell", name: "basic", input: { command: "echo test" } },
    { tool: "local_shell", name: "basic", input: { command: "echo test" } },
    { tool: "thinker", name: "with_thought", input: { thought: "thinking..." } },
    { tool: "thinker", name: "with_prompt", input: { prompt: "thinking..." } },
    { tool: "message", name: "basic", input: { content: "hello" } },
    { tool: "code_interpreter", name: "with_code", input: { code: "print(1+1)" } },
    { tool: "code_interpreter", name: "with_command", input: { command: "echo test" } },
    { tool: "file_search", name: "with_query", input: { query: "test" } },
    { tool: "file_search", name: "with_prompt", input: { prompt: "find config files" } },
    { tool: "browser_search", name: "basic", input: { query: "test" } },
    { tool: "visit_website", name: "with_url", input: { url: "https://example.com" } },
    { tool: "end_turn", name: "basic", input: {} },

    // No-op tools (verify schemas parse without error)
    { tool: "image_generation", name: "basic", input: { prompt: "a cat" } },
    { tool: "wolfram_alpha", name: "basic", input: { query: "2+2" } },
    { tool: "tts", name: "basic", input: { text: "hello" } },
    { tool: "voice_speak", name: "basic", input: { text: "hello from Symphony" } },
    { tool: "browser_automation", name: "basic", input: { action: "click" } },
    { tool: "computer_use", name: "basic", input: { action: "screenshot" } },
    { tool: "mcp_list_tools", name: "basic", input: {} },
  ];

  // Verify catch-all proxy returns a tool for unknown names
  // (the proxy emits a logWarn for unknown tool access — expected during self-test)
  const catchAllTool = toolsProxy["completely_hallucinated_tool_name_xyz"];
  if (!catchAllTool || !catchAllTool.execute) {
    logError(`❌ Catch-all proxy self-test FAILED: did not return a tool for unknown name`);
    process.exit(1);
  }
  // Verify known tools still pass through the proxy
  if (toolsProxy["exec"] !== tools["exec"]) {
    logError(`❌ Catch-all proxy self-test FAILED: known tool "exec" was not passed through`);
    process.exit(1);
  }
  // Verify Object.keys only returns known tools (proxy doesn't leak catch-all names)
  if (Object.keys(toolsProxy).length !== Object.keys(tools).length) {
    logError(`❌ Catch-all proxy self-test FAILED: Object.keys(toolsProxy) leaked unknown tools`);
    process.exit(1);
  }
  logInfo(
    `🧪 Catch-all proxy self-test: passed (unknown tools return graceful no-op, known tools pass through)`,
  );

  let selfTestPassed = 0;
  const failedTests = [];

  for (const { tool: toolName, name, input } of selfTests) {
    try {
      // Validate using the tool schema directly (doesn't execute, just validates)
      const toolDef = tools[toolName];
      if (!toolDef) {
        logError(`❌ Schema self-test FAILED: ${toolName}/${name} — tool not found`);
        failedTests.push(`${toolName}/${name}: tool not found`);
        continue;
      }

      // Parse input through the schema
      const parsed = await toolDef.inputSchema.parseAsync(input);

      // Verify array normalization worked correctly
      if (toolName === "run_file_change_hooks" || toolName === "read_files") {
        const key = toolName === "run_file_change_hooks" ? "files" : "paths";
        if (!Array.isArray(parsed[key])) {
          throw new TypeError(
            `Expected ${key} to be normalized to array, got ${typeof parsed[key]}`,
          );
        }
      }

      selfTestPassed++;
      logDebug(`✅ Schema test passed: ${toolName}/${name}`);
    } catch (err) {
      logError(`❌ Schema self-test FAILED: ${toolName}/${name} — ${err.message}`);
      failedTests.push(`${toolName}/${name}: ${err.message}`);
    }
  }

  if (selfTestPassed < selfTests.length) {
    logError(
      `🧪 Tool schema self-test FAILED (${selfTestPassed}/${selfTests.length}) — refusing to start`,
    );
    logError(`Failed tests:`);
    for (const failure of failedTests) {
      logError(`  - ${failure}`);
    }
    process.exit(1);
  }
  logInfo(
    `🧪 Tool schema self-test: ${selfTestPassed}/${selfTests.length} passed (all array normalization working)`,
  );
}
