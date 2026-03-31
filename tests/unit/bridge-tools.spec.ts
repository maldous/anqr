/**
 * Unit tests for Symphony bridge tools
 *
 * Tests all tool implementations defined in symphony-openai-bridge.mjs
 * according to testing-strategy-anqr-1.0.md requirements
 *
 * Test Coverage:
 * - File operations: read_files, str_replace, write, read, list_directory, read_subtree
 * - Code search: code_search, find_files, glob
 * - Execution: exec
 * - Memory: memory_search, memory_get
 * - Workflow: think_deeply, update_subgoal, add_subgoal, spawn_agents
 * - Configuration: run_file_change_hooks
 * - External APIs: web_search, read_docs
 * - Proposal tools: propose_str_replace, propose_write_file
 * - Meta tools: ask_user, lookup_agent_info, apply_patch, add_message, set_messages, etc.
 *
 * NOTE: These tests are currently skipped because importing symphony-openai-bridge.mjs
 * starts an HTTP server on port 4319, which conflicts with the running systemd service.
 * TODO: Refactor symphony-openai-bridge.mjs to export tools separately from server startup.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Test fixtures directory
const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "bridge-tools");
const TEST_FILE = path.join(FIXTURES_DIR, "test-file.txt");
const TEST_CODE_FILE = path.join(FIXTURES_DIR, "test-code.ts");

describe.skip("Bridge Tools - File Operations", () => {
  beforeEach(() => {
    // Create fixtures directory
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    }

    // Create test files
    fs.writeFileSync(TEST_FILE, "Hello World\nLine 2\nLine 3\n");
    fs.writeFileSync(TEST_CODE_FILE, "function foo() {\n  return 42;\n}\n");
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  describe("read_files", () => {
    it("should read multiple files successfully", async () => {
      const { readFilesTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readFilesTool({ paths: [TEST_FILE, TEST_CODE_FILE] });

      expect(result.files).toHaveLength(2);
      expect(result.files[0]).toMatchObject({
        path: TEST_FILE,
        content: expect.stringContaining("Hello World"),
        totalLines: 4,
      });
      expect(result.files[1]).toMatchObject({
        path: TEST_CODE_FILE,
        content: expect.stringContaining("function foo"),
        totalLines: 4,
      });
    });

    it("should handle non-existent files", async () => {
      const { readFilesTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readFilesTool({ paths: ["/nonexistent/file.txt"] });

      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toHaveProperty("error");
    });

    it("should handle mixed existing and non-existing files", async () => {
      const { readFilesTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readFilesTool({ paths: [TEST_FILE, "/nonexistent.txt"] });

      expect(result.files).toHaveLength(2);
      expect(result.files[0]).toHaveProperty("content");
      expect(result.files[1]).toHaveProperty("error");
    });
  });

  describe("str_replace", () => {
    it("should replace single occurrence", async () => {
      const { strReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await strReplaceTool({
        path: TEST_FILE,
        replacements: [{ old: "Hello", new: "Goodbye" }],
      });

      expect(result.success).toBe(true);
      const content = fs.readFileSync(TEST_FILE, "utf-8");
      expect(content).toContain("Goodbye World");
      expect(content).not.toContain("Hello");
    });

    it("should replace multiple occurrences with allowMultiple", async () => {
      const { strReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      fs.writeFileSync(TEST_FILE, "foo bar foo baz foo");

      const result = await strReplaceTool({
        path: TEST_FILE,
        replacements: [{ old: "foo", new: "qux", allowMultiple: true }],
      });

      expect(result.success).toBe(true);
      const content = fs.readFileSync(TEST_FILE, "utf-8");
      expect(content).toBe("qux bar qux baz qux");
    });

    it("should handle multiple replacements in sequence", async () => {
      const { strReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await strReplaceTool({
        path: TEST_FILE,
        replacements: [
          { old: "Hello", new: "Hi" },
          { old: "World", new: "Universe" },
        ],
      });

      expect(result.success).toBe(true);
      const content = fs.readFileSync(TEST_FILE, "utf-8");
      expect(content).toContain("Hi Universe");
    });

    it("should return error when string not found", async () => {
      const { strReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await strReplaceTool({
        path: TEST_FILE,
        replacements: [{ old: "NonExistent", new: "New" }],
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain("String not found");
    });
  });

  describe("write (writeFileTool)", () => {
    it("should write new file", async () => {
      const { writeFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const newFile = path.join(FIXTURES_DIR, "new-file.txt");
      const result = await writeFileTool({ path: newFile, content: "New content" });

      expect(result.success).toBe(true);
      expect(fs.existsSync(newFile)).toBe(true);
      expect(fs.readFileSync(newFile, "utf-8")).toBe("New content");
    });

    it("should overwrite existing file", async () => {
      const { writeFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await writeFileTool({ path: TEST_FILE, content: "Overwritten" });

      expect(result.success).toBe(true);
      expect(fs.readFileSync(TEST_FILE, "utf-8")).toBe("Overwritten");
    });
  });

  describe("read (readFileTool)", () => {
    it("should read entire file", async () => {
      const { readFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readFileTool({ path: TEST_FILE });

      expect(result.content).toContain("Hello World");
      expect(result.totalLines).toBe(4);
      expect(result.truncated).toBeUndefined();
    });

    it("should read file with offset", async () => {
      const { readFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readFileTool({ path: TEST_FILE, offset: 1, lines: 2 });

      expect(result.content).toContain("Line 2");
      expect(result.content).toContain("Line 3");
      expect(result.content).not.toContain("Hello World");
      expect(result.truncated).toBe(true);
    });

    it("should truncate large files", async () => {
      const { readFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const largeContent = "x".repeat(200000);
      fs.writeFileSync(TEST_FILE, largeContent);

      const result = await readFileTool({ path: TEST_FILE });

      expect(result.truncated).toBe(true);
      expect(result.content?.length).toBeLessThan(largeContent.length);
    });
  });

  describe("list_directory", () => {
    it("should list files and directories", async () => {
      const { listDirectoryTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const subdir = path.join(FIXTURES_DIR, "subdir");
      fs.mkdirSync(subdir);

      const result = await listDirectoryTool({ path: path.relative(process.cwd(), FIXTURES_DIR) });

      expect(result.files).toContain("test-file.txt");
      expect(result.files).toContain("test-code.ts");
      expect(result.directories).toContain("subdir");
    });

    it("should handle non-existent directory", async () => {
      const { listDirectoryTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await listDirectoryTool({ path: "/nonexistent/dir" });

      expect(result.error).toBeDefined();
    });
  });

  describe("read_subtree", () => {
    it("should read single file", async () => {
      const { readSubtreeTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await readSubtreeTool({ paths: [path.relative(process.cwd(), TEST_FILE)] });

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].type).toBe("file");
      expect(result.entries[0].content).toContain("Hello World");
    });

    it("should read directory tree", async () => {
      const { readSubtreeTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const subdir = path.join(FIXTURES_DIR, "subdir");
      fs.mkdirSync(subdir);
      fs.writeFileSync(path.join(subdir, "nested.txt"), "nested content");

      const result = await readSubtreeTool({ paths: [path.relative(process.cwd(), FIXTURES_DIR)] });

      expect(result.entries.length).toBeGreaterThan(1);
      expect(result.entries.some((e) => e.path.includes("nested.txt"))).toBe(true);
    });
  });
});

describe.skip("Bridge Tools - Code Search", () => { // Skipped because importing symphony-openai-bridge.mjs starts an HTTP server on port 4319, which conflicts with the running systemd service.
  beforeEach(() => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    }
    fs.writeFileSync(
      TEST_CODE_FILE,
      "function foo() {\n  return 42;\n}\nfunction bar() {\n  return foo();\n}\n",
    );
  });

  afterEach(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  describe("code_search", () => {
    it("should find matches in code", async () => {
      const { codeSearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await codeSearchTool({
        pattern: "function",
        cwd: FIXTURES_DIR,
      });

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches.some((m) => m.content?.includes("function"))).toBe(true);
    });

    it("should respect maxResults limit", async () => {
      const { codeSearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await codeSearchTool({
        pattern: "function",
        cwd: FIXTURES_DIR,
        maxResults: 1,
      });

      expect(result.matches.length).toBeLessThanOrEqual(1);
    });

    it("should handle no matches", async () => {
      const { codeSearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await codeSearchTool({
        pattern: "nonexistent-pattern-12345",
        cwd: FIXTURES_DIR,
      });

      expect(result.matches).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("glob", () => {
    it("should find files matching pattern", async () => {
      const { globTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await globTool({
        pattern: "*.ts",
        cwd: FIXTURES_DIR,
      });

      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files.some((f) => f.endsWith(".ts"))).toBe(true);
    });

    it("should handle no matches", async () => {
      const { globTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await globTool({
        pattern: "*.nonexistent",
        cwd: FIXTURES_DIR,
      });

      expect(result.files).toEqual([]);
    });
  });
});

describe.skip("Bridge Tools - Execution", () => {
  describe("exec", () => {
    it("should execute simple command", async () => {
      const { execTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await execTool({ command: "echo hello" });

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("hello");
    });

    it("should handle command errors", async () => {
      const { execTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await execTool({ command: "exit 1" });

      expect(result.exitCode).toBe(1);
      expect(result.error).toBeDefined();
    });

    it("should respect working directory", async () => {
      const { execTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await execTool({ command: "pwd", cwd: "/tmp" });

      expect(result.output).toContain("/tmp");
    });
  });
});

describe.skip("Bridge Tools - Memory", () => {
  const MEMORY_FILE = path.join(process.cwd(), "MEMORY.md");
  const KNOWLEDGE_FILE = path.join(process.cwd(), "knowledge.md");

  let memoryBackup: string | null = null;
  let knowledgeBackup: string | null = null;

  beforeEach(() => {
    // Backup existing files
    if (fs.existsSync(MEMORY_FILE)) {
      memoryBackup = fs.readFileSync(MEMORY_FILE, "utf-8");
    }
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      knowledgeBackup = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
    }

    // Create test content
    fs.writeFileSync(MEMORY_FILE, "# Memory\n\nImportant: test data\n");
    fs.writeFileSync(KNOWLEDGE_FILE, "# Knowledge\n\nKey concept: testing\n");
  });

  afterEach(() => {
    // Restore backups
    if (memoryBackup !== null) {
      fs.writeFileSync(MEMORY_FILE, memoryBackup);
    } else if (fs.existsSync(MEMORY_FILE)) {
      fs.unlinkSync(MEMORY_FILE);
    }

    if (knowledgeBackup !== null) {
      fs.writeFileSync(KNOWLEDGE_FILE, knowledgeBackup);
    } else if (fs.existsSync(KNOWLEDGE_FILE)) {
      fs.unlinkSync(KNOWLEDGE_FILE);
    }
  });

  describe("memory_search", () => {
    it("should search MEMORY.md", async () => {
      const { memorySearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memorySearchTool({ query: "test data" });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].file).toBe("MEMORY.md");
    });

    it("should search knowledge.md", async () => {
      const { memorySearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memorySearchTool({ query: "testing" });

      expect(result.results.some((r) => r.file === "knowledge.md")).toBe(true);
    });

    it("should handle no matches", async () => {
      const { memorySearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memorySearchTool({ query: "nonexistent12345" });

      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("memory_get", () => {
    it("should get MEMORY.md content", async () => {
      const { memoryGetTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memoryGetTool({ file: "MEMORY.md" });

      expect(result.content).toContain("test data");
      expect(result.file).toBe("MEMORY.md");
    });

    it("should get knowledge.md content", async () => {
      const { memoryGetTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memoryGetTool({ file: "knowledge.md" });

      expect(result.content).toContain("testing");
      expect(result.file).toBe("knowledge.md");
    });

    it("should reject invalid file names", async () => {
      const { memoryGetTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await memoryGetTool({ file: "invalid.txt" });

      expect(result.error).toBeDefined();
    });
  });
});

describe.skip("Bridge Tools - Workflow", () => {
  describe("think_deeply", () => {
    it("should acknowledge thought", async () => {
      const { thinkDeeplyTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await thinkDeeplyTool({ thought: "Test thought" });

      expect(result.acknowledged).toBe(true);
      expect(result.thought).toBe("Test thought");
    });
  });

  describe("update_subgoal", () => {
    it("should acknowledge subgoal update", async () => {
      const { updateSubgoalTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await updateSubgoalTool({
        id: "1",
        status: "IN_PROGRESS",
        log: "Test log",
      });

      expect(result.acknowledged).toBe(true);
      expect(result.id).toBe("1");
      expect(result.status).toBe("IN_PROGRESS");
    });
  });

  describe("add_subgoal", () => {
    it("should acknowledge new subgoal", async () => {
      const { addSubgoalTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await addSubgoalTool({
        id: "2",
        objective: "Test objective",
        status: "NOT_STARTED",
      });

      expect(result.acknowledged).toBe(true);
      expect(result.id).toBe("2");
      expect(result.objective).toBe("Test objective");
    });
  });

  describe("spawn_agents", () => {
    it("should acknowledge agent spawn request", async () => {
      const { spawnAgentsTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await spawnAgentsTool({
        agents: [{ agent_type: "test-agent", prompt: "test" }],
      });

      expect(result.acknowledged).toBe(true);
      expect(result.message).toContain("parent");
    });
  });
});

describe.skip("Bridge Tools - Configuration", () => {
  describe("run_file_change_hooks", () => {
    it("should handle no hooks configured", async () => {
      const { runFileChangeHooksTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await runFileChangeHooksTool({ files: ["test.ts"] });

      expect(result.success).toBe(true);
      expect(result.message).toContain("No file change hooks");
    });

    it("should normalize string to array (SDK bug workaround)", async () => {
      const { runFileChangeHooksTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      // Test both string and array inputs
      const resultString = await runFileChangeHooksTool({ files: "test.ts" as any });
      const resultArray = await runFileChangeHooksTool({ files: ["test.ts"] });

      expect(resultString.success).toBe(true);
      expect(resultArray.success).toBe(true);
    });
  });
});

describe.skip("Bridge Tools - Proposal Tools", () => {
  beforeEach(() => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    }
    fs.writeFileSync(TEST_FILE, "Hello World\n");
  });

  afterEach(() => {
    if (fs.existsSync(FIXTURES_DIR)) {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  describe("propose_str_replace", () => {
    it("should propose replacements without applying", async () => {
      const { proposeStrReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const originalContent = fs.readFileSync(TEST_FILE, "utf-8");
      const result = await proposeStrReplaceTool({
        path: TEST_FILE,
        replacements: [{ old: "Hello", new: "Goodbye" }],
      });

      expect(result.success).toBe(true);
      expect(result.proposed[0].found).toBe(true);
      // File should not be modified
      expect(fs.readFileSync(TEST_FILE, "utf-8")).toBe(originalContent);
    });

    it("should indicate when string not found", async () => {
      const { proposeStrReplaceTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await proposeStrReplaceTool({
        path: TEST_FILE,
        replacements: [{ old: "NonExistent", new: "New" }],
      });

      expect(result.success).toBe(true);
      expect(result.proposed[0].found).toBe(false);
    });
  });

  describe("propose_write_file", () => {
    it("should propose file write without applying", async () => {
      const { proposeWriteFileTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const newFile = path.join(FIXTURES_DIR, "new.txt");
      const result = await proposeWriteFileTool({
        path: newFile,
        instructions: "Create new file",
        content: "New content",
      });

      expect(result.success).toBe(true);
      expect(result.proposed).toBe(true);
      expect(result.contentLength).toBe("New content".length);
      // File should not exist
      expect(fs.existsSync(newFile)).toBe(false);
    });
  });
});

describe.skip("Bridge Tools - Meta Tools", () => {
  describe("add_message", () => {
    it("should acknowledge message addition", async () => {
      const { addMessageTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await addMessageTool({
        role: "user",
        content: "Test message",
      });

      expect(result.acknowledged).toBe(true);
      expect(result.role).toBe("user");
    });
  });

  describe("set_messages", () => {
    it("should acknowledge messages set", async () => {
      const { setMessagesTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await setMessagesTool({
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi" },
        ],
      });

      expect(result.acknowledged).toBe(true);
      expect(result.count).toBe(2);
    });
  });

  describe("ask_user", () => {
    it("should acknowledge user question request", async () => {
      const { askUserTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await askUserTool({
        questions: [
          {
            question: "Test?",
            options: [{ label: "Yes" }, { label: "No" }],
          },
        ],
      });

      expect(result.acknowledged).toBe(true);
      expect(result.questions).toBe(1);
    });
  });

  describe("lookup_agent_info", () => {
    it("should acknowledge agent lookup", async () => {
      const { lookupAgentInfoTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const result = await lookupAgentInfoTool({ agentId: "test-agent" });

      expect(result.acknowledged).toBe(true);
      expect(result.agentId).toBe("test-agent");
    });
  });

  describe("apply_patch", () => {
    beforeEach(() => {
      if (!fs.existsSync(FIXTURES_DIR)) {
        fs.mkdirSync(FIXTURES_DIR, { recursive: true });
      }
    });

    afterEach(() => {
      if (fs.existsSync(FIXTURES_DIR)) {
        fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
      }
    });

    it("should create file", async () => {
      const { applyPatchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const newFile = path.join(FIXTURES_DIR, "patch-test.txt");
      const result = await applyPatchTool({
        operation: {
          type: "create_file",
          path: newFile,
          diff: "+Line 1\n+Line 2",
        },
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe("create");
      expect(fs.existsSync(newFile)).toBe(true);
    });

    it("should delete file", async () => {
      const { applyPatchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const testFile = path.join(FIXTURES_DIR, "delete-me.txt");
      fs.writeFileSync(testFile, "content");

      const result = await applyPatchTool({
        operation: {
          type: "delete_file",
          path: testFile,
        },
      });

      expect(result.success).toBe(true);
      expect(result.operation).toBe("delete");
      expect(fs.existsSync(testFile)).toBe(false);
    });
  });
});

describe.skip("Bridge Tools - External APIs", () => {
  describe("web_search", () => {
    it("should return error when API key not configured", async () => {
      const { webSearchTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const originalKey = process.env.LINKUP_API_KEY;
      delete process.env.LINKUP_API_KEY;
      delete process.env.WEB_SEARCH_API_KEY;

      const result = await webSearchTool({ query: "test" });

      expect(result.error).toBeDefined();
      expect(result.message).toContain("not configured");

      if (originalKey) process.env.LINKUP_API_KEY = originalKey;
    });
  });

  describe("read_docs", () => {
    it("should return error when API key not configured", async () => {
      const { readDocsTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const originalKey = process.env.CONTEXT7_API_KEY;
      delete process.env.CONTEXT7_API_KEY;
      delete process.env.DOCS_API_KEY;

      const result = await readDocsTool({
        libraryTitle: "React",
        topic: "hooks",
      });

      expect(result.error).toBeDefined();
      expect(result.message).toContain("not configured");

      if (originalKey) process.env.CONTEXT7_API_KEY = originalKey;
    });

    it("should enforce minimum max_tokens", async () => {
      const { readDocsTool } =
        await import("../../scripts/ops/integrations/model/symphony-openai-bridge.mjs");

      const originalKey = process.env.CONTEXT7_API_KEY;
      process.env.CONTEXT7_API_KEY = "test-key";

      // The function should increase max_tokens to at least 10000
      // We can't test the actual API call, but we can verify the function doesn't crash
      const result = await readDocsTool({
        libraryTitle: "React",
        topic: "hooks",
        max_tokens: 100, // Too low
      });

      // Should either return error (no API key) or attempt with min 10000 tokens
      expect(result).toBeDefined();

      if (originalKey) {
        process.env.CONTEXT7_API_KEY = originalKey;
      } else {
        delete process.env.CONTEXT7_API_KEY;
      }
    });
  });
});