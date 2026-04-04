/**
 * Integration tests for Symphony bridge tools
 *
 * Tests bridge tool integration with the AI SDK, credit-gate, and file system
 * according to testing-strategy-anqr-1.0.md requirements
 *
 * These tests verify:
 * - Tool execution through the AI SDK tool protocol
 * - File change tracking and hooks
 * - Session state integration
 * - Error handling and recovery
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const FIXTURES_DIR = path.join(process.cwd(), "tests", "fixtures", "bridge-integration");

describe("Bridge Tools Integration - File Change Tracking", () => {
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

  it("should track file changes from write tool", async () => {
    const { writeFileTool, setCurrentRequestId, getCurrentRequestId } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "tracked.txt");
    setCurrentRequestId("test-req-1");

    await writeFileTool({ path: testFile, content: "test content" });

    expect(getCurrentRequestId()).toBe("test-req-1");
    expect(fs.existsSync(testFile)).toBe(true);
  });

  it("should track file changes from str_replace tool", async () => {
    const { strReplaceTool, setCurrentRequestId } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "replace-tracked.txt");
    fs.writeFileSync(testFile, "original content");

    setCurrentRequestId("test-req-2");

    await strReplaceTool({
      path: testFile,
      replacements: [{ old: "original", new: "modified" }],
    });

    const content = fs.readFileSync(testFile, "utf-8");
    expect(content).toContain("modified");
  });

  it("should track file changes from apply_patch tool", async () => {
    const { applyPatchTool, setCurrentRequestId } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "patch-tracked.txt");
    setCurrentRequestId("test-req-3");

    await applyPatchTool({
      operation: {
        type: "create_file",
        path: testFile,
        diff: "+new content",
      },
    });

    expect(fs.existsSync(testFile)).toBe(true);
  });
});

describe("Bridge Tools Integration - File Operations Workflow", () => {
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

  it("should support read-modify-write workflow", async () => {
    const { readFileTool, strReplaceTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "workflow.txt");
    fs.writeFileSync(testFile, "Step 1\nStep 2\nStep 3\n");

    // Read
    const readResult = await readFileTool({ path: testFile, offset: undefined, lines: undefined });
    expect(readResult.content).toContain("Step 1");

    // Modify
    await strReplaceTool({
      path: testFile,
      replacements: [{ old: "Step 2", new: "Step 2 (modified)" }],
    });

    // Verify
    const verifyResult = await readFileTool({
      path: testFile,
      offset: undefined,
      lines: undefined,
    });
    expect(verifyResult.content).toContain("Step 2 (modified)");
  });

  it("should support search and replace workflow", async () => {
    const { codeSearchTool, strReplaceTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "search-replace.ts");
    fs.writeFileSync(testFile, "function oldName() {\n  return 42;\n}\nconst x = oldName();\n");

    // Search
    const searchResult = await codeSearchTool({
      pattern: "oldName",
      flags: "",
      cwd: FIXTURES_DIR,
    });
    expect(searchResult.matches.length).toBeGreaterThan(0);

    // Replace all occurrences
    await strReplaceTool({
      path: testFile,
      replacements: [{ old: "oldName", new: "newName", allowMultiple: true }],
    });

    // Verify replacement
    const content = fs.readFileSync(testFile, "utf-8");
    expect(content).not.toContain("oldName");
    expect(content).toContain("newName");
  });

  it("should support directory exploration workflow", async () => {
    const { listDirectoryTool, readSubtreeTool, readFilesTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    // Create structure
    fs.writeFileSync(path.join(FIXTURES_DIR, "file1.txt"), "content1");
    fs.writeFileSync(path.join(FIXTURES_DIR, "file2.txt"), "content2");
    const subdir = path.join(FIXTURES_DIR, "subdir");
    fs.mkdirSync(subdir);
    fs.writeFileSync(path.join(subdir, "file3.txt"), "content3");

    // List directory
    const listResult = await listDirectoryTool({
      path: path.relative(process.cwd(), FIXTURES_DIR),
    });
    expect(listResult.files).toContain("file1.txt");
    expect(listResult.directories).toContain("subdir");

    // Read subtree
    const subtreeResult = await readSubtreeTool({
      paths: [path.relative(process.cwd(), FIXTURES_DIR)],
    });
    expect(subtreeResult.entries!.length).toBeGreaterThan(2);

    // Read specific files
    const filesResult = await readFilesTool({
      paths: [path.join(FIXTURES_DIR, "file1.txt"), path.join(FIXTURES_DIR, "file2.txt")],
    });
    expect(filesResult.files).toHaveLength(2);
  });
});

describe("Bridge Tools Integration - Error Handling", () => {
  it("should handle file not found gracefully", async () => {
    const { readFileTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const result = await readFileTool({
      path: "/nonexistent/file.txt",
      offset: undefined,
      lines: undefined,
    });
    expect(result.error).toBeDefined();
  });

  it("should handle permission errors gracefully", async () => {
    const { writeFileTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const result = await writeFileTool({
      path: "/root/protected.txt",
      content: "should fail",
    });

    // Should return error, not throw
    expect(result.error || result.success === false).toBeTruthy();
  });

  it("should handle invalid regex patterns in code search", async () => {
    const { codeSearchTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    // Invalid regex should be caught and return empty results
    const result = await codeSearchTool({
      pattern: "[invalid(regex",
      flags: "",
      cwd: process.cwd(),
    });

    // Should not crash, should return error or empty results
    expect(result).toBeDefined();
  });

  it("should handle command timeout in exec tool", async () => {
    const { execTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const result = await execTool({
      command: "sleep 120", // Will be killed by 60s timeout
      cwd: undefined,
    });

    expect(result.error || result.exitCode !== 0).toBeTruthy();
  });
});

describe("Bridge Tools Integration - Proposal Tools Safety", () => {
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

  it("should not modify files with propose_str_replace", async () => {
    const { proposeStrReplaceTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "propose-test.txt");
    const originalContent = "original content";
    fs.writeFileSync(testFile, originalContent);

    await proposeStrReplaceTool({
      path: testFile,
      replacements: [{ old: "original", new: "modified" }],
    });

    const afterContent = fs.readFileSync(testFile, "utf-8");
    expect(afterContent).toBe(originalContent);
  });

  it("should not create files with propose_write_file", async () => {
    const { proposeWriteFileTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "proposed-new.txt");

    await proposeWriteFileTool({
      path: testFile,
      instructions: "Create file",
      content: "new content",
    });

    expect(fs.existsSync(testFile)).toBe(false);
  });

  it("should validate proposal feasibility", async () => {
    const { proposeStrReplaceTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const testFile = path.join(FIXTURES_DIR, "validate-proposal.txt");
    fs.writeFileSync(testFile, "content");

    const result = await proposeStrReplaceTool({
      path: testFile,
      replacements: [
        { old: "content", new: "new" }, // Found
        { old: "missing", new: "replacement" }, // Not found
      ],
    });

    expect(result.proposed![0].found).toBe(true);
    expect(result.proposed![1].found).toBe(false);
  });
});

describe("Bridge Tools Integration - Memory Operations", () => {
  const MEMORY_FILE = path.join(process.cwd(), "MEMORY.md");
  const KNOWLEDGE_FILE = path.join(process.cwd(), "knowledge.md");

  let memoryBackup: string | null = null;
  let knowledgeBackup: string | null = null;

  beforeEach(() => {
    if (fs.existsSync(MEMORY_FILE)) {
      memoryBackup = fs.readFileSync(MEMORY_FILE, "utf-8");
    }
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      knowledgeBackup = fs.readFileSync(KNOWLEDGE_FILE, "utf-8");
    }

    fs.writeFileSync(MEMORY_FILE, "# Memory\n\n## Recent Work\n\nCompleted: test feature\n");
    fs.writeFileSync(KNOWLEDGE_FILE, "# Knowledge\n\n## Best Practices\n\nAlways test code\n");
  });

  afterEach(() => {
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

  it("should support memory search and retrieval workflow", async () => {
    const { memorySearchTool, memoryGetTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    // Search for content
    const searchResult = await memorySearchTool({ query: "test feature" });
    expect(searchResult.results.length).toBeGreaterThan(0);

    // Get full file
    const getResult = await memoryGetTool({ file: "MEMORY.md" });
    expect(getResult.content).toContain("test feature");
  });

  it("should search across both memory and knowledge files", async () => {
    const { memorySearchTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const result = await memorySearchTool({ query: "test" });

    const fileNames = result.results.map((r: { file: string }) => r.file);
    expect(fileNames).toContain("MEMORY.md");
    expect(fileNames).toContain("knowledge.md");
  });
});

describe("Bridge Tools Integration - Execution Safety", () => {
  it("should enforce timeout on long-running commands", async () => {
    const { execTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const startTime = Date.now();
    const result = await execTool({
      command: "sleep 120",
      cwd: undefined,
    });
    const duration = Date.now() - startTime;

    // Should timeout well before 120 seconds
    expect(duration).toBeLessThan(65000); // 65s with buffer
    expect(result.error || result.exitCode !== 0).toBeTruthy();
  });

  it("should limit output buffer size", async () => {
    const { execTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    // Generate large output
    const result = await execTool({
      command: "seq 1 1000000",
      cwd: undefined,
    });

    // Should not crash, may truncate or error
    expect(result).toBeDefined();
  });

  it("should isolate command execution by cwd", async () => {
    const { execTool } =
      await import("../../harness/ops/integrations/model/symphony-openai-bridge.mjs");

    const result = await execTool({
      command: "pwd",
      cwd: "/tmp",
    });

    expect(result.output).toContain("/tmp");
    expect(result.output).not.toContain(process.cwd());
  });
});
