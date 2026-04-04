/**
 * TypeScript declaration file for symphony-openai-bridge.mjs
 * This provides type definitions for the bridge module used in tests
 */

declare module "*symphony-openai-bridge.mjs" {
  // File operations
  export const readFilesTool: (params: { paths: string[] }) => Promise<{
    files: Array<{ path: string; content?: string; error?: string; totalLines?: number }>;
  }>;

  export const strReplaceTool: (params: {
    path: string;
    replacements: Array<{ old: string; new: string; allowMultiple?: boolean }>;
  }) => Promise<{ success: boolean; error?: string }>;

  export const writeFileTool: (params: {
    path: string;
    content: string;
  }) => Promise<{ success: boolean; error?: string }>;

  export const readFileTool: (params: {
    path: string;
    offset?: number;
    lines?: number;
  }) => Promise<{
    content?: string;
    totalLines?: number;
    truncated?: boolean;
    error?: string;
  }>;

  export const listDirectoryTool: (params: { path: string }) => Promise<{
    files: string[];
    directories: string[];
    error?: string;
  }>;

  export const readSubtreeTool: (params: { paths: string[]; maxTokens?: number }) => Promise<{
    entries: Array<{ path: string; type: string; content?: string }>;
  }>;

  // Code search
  export const codeSearchTool: (params: {
    pattern: string;
    flags?: string;
    cwd: string;
    maxResults?: number;
  }) => Promise<{
    matches: Array<{ content?: string; file?: string; line?: number }>;
    count: number;
  }>;

  export const globTool: (params: { pattern: string; cwd: string }) => Promise<{
    files: string[];
    error?: string;
  }>;

  // Execution
  export const execTool: (params: { command: string; cwd?: string }) => Promise<{
    output: string;
    exitCode: number;
    error?: string;
  }>;

  // Memory
  export const memorySearchTool: (params: { query: string }) => Promise<{
    results: Array<{ file: string; content?: string }>;
    count: number;
  }>;

  export const memoryGetTool: (params: { file: string }) => Promise<{
    content?: string;
    file?: string;
    error?: string;
  }>;

  // Workflow tools
  export const thinkDeeplyTool: (params: { thought: string }) => Promise<{
    acknowledged: boolean;
    thought: string;
  }>;

  export const updateSubgoalTool: (params: {
    id: string;
    status: string;
    log?: string;
    plan?: string;
  }) => Promise<{
    acknowledged: boolean;
    id: string;
    status: string;
  }>;

  export const addSubgoalTool: (params: {
    id: string;
    objective: string;
    status: string;
    log?: string;
    plan?: string;
  }) => Promise<{
    acknowledged: boolean;
    id: string;
    objective: string;
  }>;

  export const spawnAgentsTool: (params: {
    agents: Array<{ agent_type: string; prompt: string; params?: Record<string, unknown> }>;
  }) => Promise<{
    acknowledged: boolean;
    message?: string;
  }>;

  // Configuration
  export const runFileChangeHooksTool: (params: { files: string[] | string }) => Promise<{
    success: boolean;
    message?: string;
  }>;

  // Proposal tools
  export const proposeStrReplaceTool: (params: {
    path: string;
    replacements: Array<{ old: string; new: string; allowMultiple?: boolean }>;
  }) => Promise<{
    success: boolean;
    proposed: Array<{ found: boolean; old?: string; new?: string }>;
  }>;

  export const proposeWriteFileTool: (params: {
    path: string;
    instructions: string;
    content: string;
  }) => Promise<{
    success: boolean;
    proposed: boolean;
    contentLength?: number;
  }>;

  // Meta tools
  export const addMessageTool: (params: { role: string; content: string }) => Promise<{
    acknowledged: boolean;
    role: string;
  }>;

  export const setMessagesTool: (params: {
    messages: Array<{ role: string; content: string }>;
  }) => Promise<{
    acknowledged: boolean;
    count: number;
  }>;

  export const askUserTool: (params: {
    questions: Array<{
      question: string;
      options: Array<{ label: string; description?: string }>;
      multiSelect?: boolean;
      validation?: Record<string, unknown>;
    }>;
  }) => Promise<{
    acknowledged: boolean;
    questions: number;
  }>;

  export const lookupAgentInfoTool: (params: { agentId: string }) => Promise<{
    acknowledged: boolean;
    agentId: string;
  }>;

  export const applyPatchTool: (params: {
    operation: {
      type: string;
      path: string;
      diff?: string;
    };
  }) => Promise<{
    success: boolean;
    operation?: string;
    error?: string;
  }>;

  // External APIs
  export const webSearchTool: (params: { query: string }) => Promise<{
    results?: unknown[];
    error?: string;
    message?: string;
  }>;

  export const readDocsTool: (params: {
    libraryTitle: string;
    topic: string;
    max_tokens?: number;
  }) => Promise<{
    content?: string;
    error?: string;
    message?: string;
  }>;

  // Session state
  export const setCurrentRequestId: (id: string) => void;
  export const getCurrentRequestId: () => string | null;
}
