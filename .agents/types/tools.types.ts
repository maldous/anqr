/**
 * Union type of all available tool names
 */
export type ToolName =
  // ── Core tools ────────────────────────────────────────────────────────
  | "add_message"
  | "add_subgoal"
  | "apply_patch"
  | "ask_user"
  | "code_search"
  | "end_turn"
  | "exec"
  | "find_files"
  | "glob"
  | "list_directory"
  | "lookup_agent_info"
  | "memory_get"
  | "memory_search"
  | "propose_str_replace"
  | "propose_write_file"
  | "read"
  | "read_docs"
  | "read_file"
  | "read_files"
  | "read_subtree"
  | "run_file_change_hooks"
  | "run_terminal_command"
  | "search_linear_issues"
  | "set_messages"
  | "set_output"
  | "skill"
  | "spawn_agents"
  | "str_replace"
  | "suggest_followups"
  | "task_completed"
  | "think_deeply"
  | "update_subgoal"
  | "voice_speak"
  | "web_search"
  | "write"
  | "write_file"
  | "write_todos"
  // ── Aliases & cross-provider compatibility ─────────────────────────────
  | "browser_logs"
  | "browser_search"
  | "code_interpreter"
  | "create_plan"
  | "file_search"
  | "local_shell"
  | "mcp_list_tools"
  | "message"
  | "shell"
  | "thinker"
  | "visit_website"
  // ── Graceful no-ops (documented but unavailable in headless env) ──────
  | "browser_automation"
  | "computer_use"
  | "connector_gmail"
  | "connector_googlecalendar"
  | "connector_googledrive"
  | "image_generation"
  | "tts"
  | "wolfram_alpha";

/**
 * Map of tool names to their parameter types
 */
export interface ToolParamsMap {
  // ── Core tools ────────────────────────────────────────────────────────
  add_message: AddMessageParams;
  add_subgoal: AddSubgoalParams;
  apply_patch: ApplyPatchParams;
  ask_user: AskUserParams;
  code_search: CodeSearchParams;
  end_turn: EndTurnParams;
  exec: ExecParams;
  find_files: FindFilesParams;
  glob: GlobParams;
  list_directory: ListDirectoryParams;
  lookup_agent_info: LookupAgentInfoParams;
  memory_get: MemoryGetParams;
  memory_search: MemorySearchParams;
  propose_str_replace: ProposeStrReplaceParams;
  propose_write_file: ProposeWriteFileParams;
  read: ReadParams;
  read_docs: ReadDocsParams;
  read_file: ReadFileParams;
  read_files: ReadFilesParams;
  read_subtree: ReadSubtreeParams;
  run_file_change_hooks: RunFileChangeHooksParams;
  run_terminal_command: RunTerminalCommandParams;
  search_linear_issues: SearchLinearIssuesParams;
  set_messages: SetMessagesParams;
  set_output: SetOutputParams;
  skill: SkillParams;
  spawn_agents: SpawnAgentsParams;
  str_replace: StrReplaceParams;
  suggest_followups: SuggestFollowupsParams;
  task_completed: TaskCompletedParams;
  think_deeply: ThinkDeeplyParams;
  update_subgoal: UpdateSubgoalParams;
  voice_speak: VoiceSpeakParams;
  web_search: WebSearchParams;
  write: WriteParams;
  write_file: WriteFileParams;
  write_todos: WriteTodosParams;
  // ── Aliases & cross-provider compatibility ─────────────────────────────
  browser_logs: BrowserLogsParams;
  browser_search: BrowserSearchParams;
  code_interpreter: CodeInterpreterParams;
  create_plan: CreatePlanParams;
  file_search: FileSearchParams;
  local_shell: LocalShellParams;
  mcp_list_tools: McpListToolsParams;
  message: MessageParams;
  shell: ShellParams;
  thinker: ThinkerParams;
  visit_website: VisitWebsiteParams;
  // ── Graceful no-ops ───────────────────────────────────────────────────
  browser_automation: BrowserAutomationParams;
  computer_use: ComputerUseParams;
  connector_gmail: ConnectorGmailParams;
  connector_googlecalendar: ConnectorGoogleCalendarParams;
  connector_googledrive: ConnectorGoogleDriveParams;
  image_generation: ImageGenerationParams;
  tts: TtsParams;
  wolfram_alpha: WolframAlphaParams;
}

// ============================================================================
// Core Tool Parameter Interfaces
// ============================================================================

/**
 * Add a new message to the conversation history.
 */
export interface AddMessageParams {
  role: "user" | "assistant";
  content: string;
}

/**
 * Add a new subgoal for tracking progress on complex requests.
 */
export interface AddSubgoalParams {
  /** A unique identifier for the subgoal */
  id: string;
  /** The objective of the subgoal, concisely and clearly stated */
  objective: string;
  /** The status of the subgoal */
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "ABORTED";
  /** A log message for the subgoal progress */
  log?: string;
  /** A plan for the subgoal */
  plan?: string;
}

/**
 * Apply a file operation (create, update, or delete) using Codex-style apply_patch format.
 */
export interface ApplyPatchParams {
  /** The file operation to perform. */
  operation: {
    /** Operation type: create_file, update_file, or delete_file */
    type: "create_file" | "update_file" | "delete_file";
    /** File path relative to project root */
    path: string;
    /** Diff content. Required for create_file and update_file. Lines prefixed with + for creates, unified diff with @@ hunks for updates. */
    diff?: string;
  };
}

/**
 * Ask the user multiple choice questions and pause execution until they respond.
 */
export interface AskUserParams {
  /** List of multiple choice questions to ask the user */
  questions: {
    /** The question to ask the user */
    question: string;
    /** Short label (max 18 chars) displayed as a chip/tag */
    header?: string;
    /** Array of answer options with label and optional description (minimum 2) */
    options: {
      /** The display text for this option */
      label: string;
      /** Explanation shown when option is focused */
      description?: string;
    }[];
    /** If true, allows selecting multiple options (checkbox). If false, single selection only (radio). */
    multiSelect?: boolean;
    /** Validation rules for "Other" text input */
    validation?: {
      maxLength?: number;
      minLength?: number;
      pattern?: string;
      patternError?: string;
    };
  }[];
}

/**
 * Search for string patterns in the project's files using ripgrep.
 */
export interface CodeSearchParams {
  /** The pattern to search for. */
  pattern: string;
  /** Optional ripgrep flags to customize the search (e.g., "-i" for case-insensitive, "-g *.ts -g *.js" for TypeScript and JavaScript files only). */
  flags?: string;
  /** Optional working directory to search within, relative to the project root. */
  cwd?: string;
  /** Maximum number of results to return per file. Defaults to 15. */
  maxResults?: number;
}

/**
 * End your turn, regardless of any new tool results that might be coming.
 */
export interface EndTurnParams {}

/**
 * Execute a shell command and return the output.
 */
export interface ExecParams {
  /** Shell command to execute */
  command: string;
  /** Working directory for the command */
  cwd?: string;
}

/**
 * Find files using local hybrid search (BM25 + semantic embeddings/RAG), with basic filename fallback.
 */
export interface FindFilesParams {
  /** Natural language description of files to find, or function/class name. Mention directories to narrow search. */
  prompt: string;
}

/**
 * Search for files matching a glob pattern.
 */
export interface GlobParams {
  /** Glob pattern to match files against (e.g., *.js, src/glob/*.ts). */
  pattern: string;
  /** Optional working directory to search within, relative to project root. */
  cwd?: string;
}

/**
 * List files and directories in the specified path.
 */
export interface ListDirectoryParams {
  /** Directory path to list, relative to the project root. */
  path: string;
}

/**
 * Retrieve information about an agent by ID.
 */
export interface LookupAgentInfoParams {
  /** Agent ID (short local or full published format) */
  agentId: string;
}

/**
 * Get the full content of a memory or knowledge file.
 */
export interface MemoryGetParams {
  /** File to read: MEMORY.md (default), knowledge.md, or CLAUDE.md */
  file?: string;
}

/**
 * Search through memory and knowledge files (MEMORY.md, knowledge.md) for specific content.
 */
export interface MemorySearchParams {
  /** Search query to find in memory files */
  query: string;
}

/**
 * Propose string replacements in a file without actually applying them.
 */
export interface ProposeStrReplaceParams {
  /** The path to the file to edit. */
  path: string;
  /** Array of replacements to make. */
  replacements: {
    /** The string to replace. Must be an exact match. */
    old: string;
    /** The string to replace the corresponding old string with. Can be empty to delete. */
    new: string;
    /** Whether to allow multiple replacements of old string. */
    allowMultiple?: boolean;
  }[];
}

/**
 * Propose creating or editing a file without actually applying the changes.
 */
export interface ProposeWriteFileParams {
  /** Path to the file relative to the project root */
  path: string;
  /** What the change is intended to do in only one sentence. */
  instructions: string;
  /** Edit snippet to apply to the file. */
  content: string;
}

/**
 * Read a single file from the filesystem.
 */
export interface ReadParams {
  /** Path to the file to read */
  path: string;
  /** Line offset to start reading from */
  offset?: number;
  /** Number of lines to read */
  lines?: number;
}

/**
 * Fetch up-to-date documentation using ANQR's local Context7 MCP/HTTP service, with cloud fallback.
 */
export interface ReadDocsParams {
  /** The library or framework name (e.g., "Next.js", "MongoDB", "React"). */
  libraryTitle: string;
  /** Specific topic to focus on (e.g., "routing", "hooks", "authentication") */
  topic: string;
  /** Maximum number of tokens to return. Defaults to 20000. */
  max_tokens?: number;
}

/**
 * Read a single file from the filesystem (alias for read).
 */
export interface ReadFileParams {
  /** Path to the file to read */
  path: string;
  /** Line offset to start reading from */
  offset?: number;
  /** Number of lines to read */
  lines?: number;
}

/**
 * Read multiple files from disk and return their contents.
 */
export interface ReadFilesParams {
  /** List of file paths to read. */
  paths: string[];
}

/**
 * Read one or more directory subtrees as a blob including subdirectories, file names, and parsed variables.
 */
export interface ReadSubtreeParams {
  /** List of paths to directories or files. If omitted, the entire project tree is used. */
  paths?: string[];
  /** Maximum token budget for the subtree blob. */
  maxTokens?: number;
}

/**
 * Execute file change hooks for modified files.
 */
export interface RunFileChangeHooksParams {
  /** List of file paths that were changed and should trigger file change hooks */
  files: string[];
}

/**
 * Execute a CLI command from the project root.
 */
export interface RunTerminalCommandParams {
  /** CLI command valid for user's OS. */
  command: string;
  /** Either SYNC (waits, returns output) or BACKGROUND (runs in background). Default SYNC */
  process_type?: "SYNC" | "BACKGROUND";
  /** The working directory to run the command in. Default is the project root. */
  cwd?: string;
  /** Set to -1 for no timeout. Does not apply for BACKGROUND commands. Default 30 */
  timeout_seconds?: number;
}

/**
 * Search the local Linear RAG index for relevant ANQR issues.
 */
export interface SearchLinearIssuesParams {
  /** Natural-language search query for prior Linear issues, incidents, regressions, or decisions */
  query: string;
  /** Maximum number of matches to return. Defaults to 5. */
  limit?: number;
}

/**
 * Set the conversation history to the provided messages.
 */
export interface SetMessagesParams {
  messages: Record<string, unknown>[];
}

/**
 * JSON object to set as the agent output. Completely replaces any previous output.
 */
export interface SetOutputParams {}

/**
 * Load a skill's full instructions when relevant to the current task.
 */
export interface SkillParams {
  /** The name of the skill to load */
  name: string;
}

/**
 * Known agent types for spawn_agents.
 *
 * - basher: Run terminal commands. REQUIRES params.command (string).
 * - file-picker: Find relevant files. REQUIRES prompt.
 * - researcher-web: Web search. REQUIRES prompt.
 * - researcher-docs: Library/framework docs. REQUIRES prompt.
 * - thinker / thinker-gpt: Deep reasoning. REQUIRES prompt.
 * - opus-agent / gpt-5-agent: General problem solving. REQUIRES prompt. Optional params.filePaths.
 * - editor: Implement code changes. No prompt or params (inherits conversation context).
 * - code-reviewer: Review code changes. REQUIRES prompt.
 * - tmux-cli: Interactive CLI testing. REQUIRES prompt. Optional params.command.
 * - browser-use: Browser automation. REQUIRES prompt. Optional params.url.
 * - harness-helper: ANQR harness help. Optional prompt, no params needed.
 * - context-pruner: Auto-prune conversation context. No prompt or params needed (spawned automatically).
 */
export type KnownAgentType =
  | "basher"
  | "file-picker"
  | "researcher-web"
  | "researcher-docs"
  | "thinker"
  | "thinker-gpt"
  | "opus-agent"
  | "gpt-5-agent"
  | "editor"
  | "code-reviewer"
  | "tmux-cli"
  | "browser-use"
  | "harness-helper"
  | "context-pruner"
  | (string & {});

/** basher agent params — command is REQUIRED */
export interface BasherParams {
  /** Terminal command to run (REQUIRED — omitting causes validation error) */
  command: string;
  /** If true, returns full output without summarization */
  rawOutput?: boolean;
  /** Timeout in seconds. Set to -1 for no timeout. Default 30. */
  timeout_seconds?: number;
}

/** opus-agent / gpt-5-agent params */
export interface GeneralAgentParams {
  /** File paths to read before thinking */
  filePaths?: string[];
}

/** file-picker params */
export interface FilePickerParams {
  /** Directories to search within */
  directories?: string[];
}

/** tmux-cli params */
export interface TmuxCliParams {
  /** CLI command to start in the tmux session */
  command?: string;
}

/** browser-use params */
export interface BrowserUseParams {
  /** Starting URL to navigate to */
  url?: string;
}

/**
 * Spawn multiple agents in parallel.
 *
 * CRITICAL: basher agent REQUIRES params.command as a non-empty string.
 */
export interface SpawnAgentsParams {
  agents: {
    agent_type: KnownAgentType;
    prompt?: string;
    params?:
      | BasherParams
      | GeneralAgentParams
      | FilePickerParams
      | TmuxCliParams
      | BrowserUseParams
      | Record<string, unknown>;
  }[];
}

/**
 * Replace strings in a file with new strings.
 */
export interface StrReplaceParams {
  /** The path to the file to edit. */
  path: string;
  /** Array of replacements to make. */
  replacements: {
    /** The string to replace. Must be an exact match. */
    old: string;
    /** The string to replace the corresponding old string with. Can be empty to delete. */
    new: string;
    /** Whether to allow multiple replacements of old string. */
    allowMultiple?: boolean;
  }[];
}

/**
 * Suggest clickable followup prompts to the user.
 */
export interface SuggestFollowupsParams {
  /** List of suggested followup prompts the user can click to send */
  followups: {
    /** The full prompt text to send as a user message when clicked */
    prompt: string;
    /** Short display label for the card (defaults to truncated prompt if not provided) */
    label?: string;
  }[];
}

/**
 * Signal that the task is complete.
 */
export interface TaskCompletedParams {}

/**
 * Deeply consider complex tasks by brainstorming approaches and tradeoffs step-by-step.
 */
export interface ThinkDeeplyParams {
  /** Detailed step-by-step analysis. */
  thought: string;
}

/**
 * Update a subgoal to track progress on multi-step tasks.
 */
export interface UpdateSubgoalParams {
  /** The id of the subgoal to update */
  id: string;
  /** Change the status of the subgoal */
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "ABORTED";
  /** Add a log message to the subgoal */
  log?: string;
  /** Change the plan for the subgoal */
  plan?: string;
}

/**
 * Speak text in a Discord voice channel via TTS through the OpenClaw Gateway.
 * The bot must already be connected to a voice channel.
 */
export interface VoiceSpeakParams {
  /** Text to speak in the Discord voice channel via TTS */
  text: string;
  /** Optional Discord guild ID. Uses first active voice session if omitted. */
  guildId?: string;
}

/**
 * Search the web for current information using Linkup API.
 */
export interface WebSearchParams {
  /** The search query to find relevant web content */
  query: string;
  /** Search depth - 'standard' for quick results, 'deep' for comprehensive search. Default is 'standard'. */
  depth?: "standard" | "deep";
}

/**
 * Write content to a file (low-level write — prefer write_file for Codebuff-native usage).
 */
export interface WriteParams {
  /** Path to the file to write */
  path: string;
  /** Content to write to the file */
  content: string;
}

/**
 * Create or overwrite a file with the given content.
 */
export interface WriteFileParams {
  /** Path to the file relative to the project root */
  path: string;
  /** What the change is intended to do in only one sentence. */
  instructions?: string;
  /** Complete file content to write */
  content: string;
}

/**
 * Write a todo list to track tasks for multi-step implementations.
 */
export interface WriteTodosParams {
  /** List of todos with their completion status. */
  todos: {
    /** Description of the task */
    task: string;
    /** Whether the task is completed */
    completed: boolean;
  }[];
}

// ============================================================================
// Alias & Cross-Provider Compatibility Tool Parameters
// ============================================================================

/**
 * Check browser console logs (limited — no live browser in this environment).
 */
export interface BrowserLogsParams {
  /** URL to check */
  url?: string;
}

/**
 * Search the web interactively (Groq GPT-OSS compatibility — delegates to web_search).
 */
export interface BrowserSearchParams {
  /** Search query */
  query: string;
}

/**
 * Execute code in a sandbox (runs via local shell — Python, Node, etc.).
 */
export interface CodeInterpreterParams {
  /** Code to execute */
  code?: string;
  /** Shell command to execute the code */
  command?: string;
  /** Programming language (python, javascript, etc.) */
  language?: string;
}

/**
 * Create a step-by-step plan for a task (alias for write_todos).
 */
export interface CreatePlanParams {
  /** List of plan steps */
  steps: {
    /** Step description */
    step?: string;
    /** Task description */
    task?: string;
    /** Whether step is done */
    completed?: boolean;
  }[];
}

/**
 * Search local project context using code_search for patterns and find_files for natural-language prompts.
 */
export interface FileSearchParams {
  /** Search query */
  query?: string;
  /** Search pattern (ripgrep) */
  pattern?: string;
  /** Natural language file description */
  prompt?: string;
}

/**
 * Execute a command on the local machine (alias for exec/shell).
 */
export interface LocalShellParams {
  /** Shell command to execute */
  command: string;
  /** Working directory */
  cwd?: string;
}

/**
 * List locally available tools plus ANQR-native context systems.
 */
export interface McpListToolsParams {
  /** MCP server name */
  server?: string;
}

/**
 * Add a message to the conversation (compatibility alias for add_message).
 */
export interface MessageParams {
  /** Message role */
  role?: "user" | "assistant";
  /** Message content */
  content: string;
}

/**
 * Execute a shell command (OpenAI shell tool compatibility).
 */
export interface ShellParams {
  /** Shell command to execute */
  command: string;
  /** Working directory */
  cwd?: string;
}

/**
 * Think deeply about a problem (alias for think_deeply).
 */
export interface ThinkerParams {
  /** The thought or problem to analyze */
  thought?: string;
  /** The problem to think about */
  prompt?: string;
}

/**
 * Fetch or navigate to a specific web page (uses web search as best-effort).
 */
export interface VisitWebsiteParams {
  /** URL to visit */
  url?: string;
  /** Search query if no URL */
  query?: string;
}

// ============================================================================
// Graceful No-Op Tool Parameters (not available in headless environment)
// ============================================================================

/**
 * Automate browser interactions (not available in headless environment).
 */
export interface BrowserAutomationParams {
  /** Browser action to perform */
  action?: string;
  /** URL to navigate to */
  url?: string;
}

/**
 * Control computer UI (not available in headless environment).
 */
export interface ComputerUseParams {
  /** UI action to perform */
  action?: string;
  /** Screen coordinates */
  coordinate?: number[];
  /** Text to type */
  text?: string;
}

/**
 * Gmail connector (not available — requires Groq connector setup).
 */
export interface ConnectorGmailParams {
  /** Gmail action */
  action?: string;
  /** Search query */
  query?: string;
}

/**
 * Google Calendar connector (not available — requires Groq connector setup).
 */
export interface ConnectorGoogleCalendarParams {
  /** Calendar action */
  action?: string;
}

/**
 * Google Drive connector (not available — requires Groq connector setup).
 */
export interface ConnectorGoogleDriveParams {
  /** Drive action */
  action?: string;
  /** Search query */
  query?: string;
}

/**
 * Generate or edit images from prompts (not available in this environment).
 */
export interface ImageGenerationParams {
  /** Image generation prompt */
  prompt?: string;
  /** Image size */
  size?: string;
}

/**
 * Text-to-speech synthesis (not available — use voice_speak for Discord voice channels).
 */
export interface TtsParams {
  /** Text to synthesize */
  text?: string;
  /** Text input */
  input?: string;
}

/**
 * Query Wolfram Alpha for computation (not available — use code_interpreter instead).
 */
export interface WolframAlphaParams {
  /** Mathematical or scientific query */
  query: string;
}

/**
 * Get parameters type for a specific tool
 */
export type GetToolParams<T extends ToolName> = ToolParamsMap[T];
