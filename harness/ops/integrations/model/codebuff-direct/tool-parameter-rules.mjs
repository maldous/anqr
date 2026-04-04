export const TOOL_PARAMETER_RULES = `# Tool Parameter Format Rules
Array-typed parameters MUST be JSON arrays.
- read_files.paths => ["file.ts"]
- run_file_change_hooks.files => ["file.ts"]
- str_replace.replacements => [{"old":"a","new":"b"}]
- spawn_agents.agents => [{"agent_type":"basher","prompt":"...","params":{"command":"pwd"}}]
Do not pass strings where arrays are required.
`;
