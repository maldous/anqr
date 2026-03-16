#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * symphony-agent.mjs — Tool-calling AI agent for Symphony
 *
 * Executes a tool-calling loop against an LLM provider (Ollama or cloud)
 * to implement code changes for a given Linear issue.
 *
 * Tools available to the agent:
 *   - read_file(path)                — read a project file
 *   - write_file(path, content)      — write/create a file
 *   - patch_file(path, search, replace) — targeted str_replace
 *   - run_command(command)           — run an allowlisted read-only command
 *   - list_directory(path)           — list directory contents
 *   - run_typecheck()               — run tsc --noEmit and return errors
 *   - run_lint()                    — run oxlint and return errors
 *   - task_complete(summary)         — signal completion
 *
 * Limits:
 *   - MAX_TURNS: tool-calling rounds before forced stop
 *   - MAX_EXECUTION_MS: hard wall-time timeout
 *   - run_command: allowlisted read-only commands only
 *
 * Legacy lessons:
 *   - Ollama tool calling works via /v1/chat/completions
 *   - qwen3.5 may emit <think> blocks — Ollama strips them from tool_calls
 *   - Single-slot Ollama means sequential tool calls only
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import {
  RUNNER_MAX_TURNS,
  RUNNER_MAX_EXECUTION_MS,
  RUNNER_MAX_OUTPUT_TOKENS,
  RUNNER_TURN_BUDGET_WARNING,
} from './symphony-config.mjs';

// ---------------------------------------------------------------------------
// Tool definitions (OpenAI function calling format)
// ---------------------------------------------------------------------------

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read a file from the project. Returns the full file content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write or create a file with the given content. Creates parent directories if needed.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root' },
          content: { type: 'string', description: 'Complete file content to write' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'patch_file',
      description: 'Make a targeted edit to a file by replacing the first occurrence of a search string with a replacement string. Use this for small, precise edits.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root' },
          search: { type: 'string', description: 'Exact string to find (first occurrence)' },
          replace: { type: 'string', description: 'Replacement string' },
        },
        required: ['path', 'search', 'replace'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Run a read-only shell command. Only allowlisted commands: rg, grep, cat, ls, find, head, tail, wc, tree, file, echo, pwd. No pipes, redirects, or chaining.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to run' },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List files and directories at the given path.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path relative to project root' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_typecheck',
      description: 'Run the TypeScript compiler (tsc --noEmit) to check for type errors. Returns the compiler output. Always run this after making changes and fix any errors before calling task_complete.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_lint',
      description: 'Run the linter (oxlint) to check for lint errors and warnings. Returns the linter output. Always run this after making changes and fix any errors or warnings before calling task_complete.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'task_complete',
      description: 'Signal that you have finished implementing the changes. You MUST run run_typecheck and run_lint first and fix any errors or warnings before calling this.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Brief summary of what was changed and why' },
        },
        required: ['summary'],
      },
    },
  },
];

const ALLOWED_COMMANDS = new Set([
  'rg', 'grep', 'cat', 'ls', 'find', 'head', 'tail', 'wc', 'tree', 'file', 'echo', 'pwd',
]);

const REQUEST_TIMEOUT_MS = 600_000; // 10 min — local Ollama needs headroom for large-context turns

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

function validatePath(projectRoot, filePath) {
  const resolved = resolve(projectRoot, filePath);
  const rel = relative(projectRoot, resolved);
  if (rel.startsWith('..') || resolve(projectRoot, rel) !== resolved) {
    throw new Error(`Path escapes project root: ${filePath}`);
  }
  if (rel.includes('node_modules') || rel === '.git' || rel.startsWith('.git/')) {
    throw new Error(`Access denied: ${filePath}`);
  }
  return resolved;
}

function toolReadFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    return `Error: ${args.path} is a directory, not a file. Use list_directory instead.`;
  }
  if (stat.size > 100_000) {
    return `Error: File too large (${stat.size} bytes). Use run_command with head/tail for partial reads.`;
  }
  return readFileSync(fullPath, 'utf-8');
}

function toolWriteFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, args.content, 'utf-8');
  return `Written: ${args.path} (${args.content.length} chars)`;
}

function toolPatchFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const content = readFileSync(fullPath, 'utf-8');
  const idx = content.indexOf(args.search);
  if (idx === -1) {
    return `Error: Search string not found in ${args.path}. Ensure the search string is an exact match including whitespace.`;
  }
  const patched = content.slice(0, idx) + args.replace + content.slice(idx + args.search.length);
  writeFileSync(fullPath, patched, 'utf-8');
  return `Patched: ${args.path} (replaced ${args.search.length} chars at offset ${idx})`;
}

function toolRunCommand(projectRoot, args) {
  const cmd = (args.command || '').trim();
  if (/[|;&><$`]/.test(cmd)) {
    return 'Error: Pipes, redirects, chaining, and variable expansion are not allowed.';
  }
  const parts = cmd.split(/\s+/);
  if (!ALLOWED_COMMANDS.has(parts[0])) {
    return `Error: Command "${parts[0]}" is not in the allowlist. Allowed: ${[...ALLOWED_COMMANDS].join(', ')}`;
  }
  try {
    const output = execSync(cmd, {
      cwd: projectRoot,
      timeout: 15_000,
      maxBuffer: 512 * 1024,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const trimmed = output.length > 8000 ? output.slice(0, 8000) + '\n... (truncated)' : output;
    return trimmed || '(no output)';
  } catch (err) {
    const stderr = err.stderr ? err.stderr.slice(0, 2000) : '';
    const stdout = err.stdout ? err.stdout.slice(0, 2000) : '';
    return `Command exited with code ${err.status || 1}:\n${stdout}\n${stderr}`.trim();
  }
}

function toolListDirectory(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path || '.');
  if (!existsSync(fullPath)) {
    return `Error: Directory not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (!stat.isDirectory()) {
    return `Error: ${args.path} is a file, not a directory. Use read_file instead.`;
  }
  const entries = readdirSync(fullPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name + '/');
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  return [...dirs.sort(), ...files.sort()].join('\n') || '(empty directory)';
}

function toolRunTypecheck(projectRoot) {
  try {
    execSync('npx tsc --noEmit', {
      cwd: projectRoot,
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' },
    });
    return 'Typecheck passed — no errors.';
  } catch (err) {
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const output = (stdout + '\n' + stderr).trim();
    return output.length > 6000 ? output.slice(0, 6000) + '\n... (truncated)' : output;
  }
}

function toolRunLint(projectRoot) {
  try {
    const output = execSync('npx oxlint -c oxlint.json src/ packages/ apps/', {
      cwd: projectRoot,
      timeout: 60_000,
      maxBuffer: 2 * 1024 * 1024,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    // oxlint exits 0 even with warnings — parse the summary line
    const warnMatch = output.match(/Found (\d+) warning/);
    const warningCount = warnMatch ? parseInt(warnMatch[1], 10) : 0;
    if (warningCount > 0) {
      return output.length > 6000 ? output.slice(0, 6000) + '\n... (truncated)' : output;
    }
    return 'Lint passed — no errors or warnings.';
  } catch (err) {
    const stdout = (err.stdout || '').toString();
    const stderr = (err.stderr || '').toString();
    const output = (stdout + '\n' + stderr).trim();
    return output.length > 6000 ? output.slice(0, 6000) + '\n... (truncated)' : output;
  }
}

function executeTool(projectRoot, toolCall) {
  const name = toolCall.function.name;

  if (name === 'run_typecheck') return toolRunTypecheck(projectRoot);
  if (name === 'run_lint') return toolRunLint(projectRoot);

  let args;
  try {
    args = JSON.parse(toolCall.function.arguments);
  } catch {
    return `Error: Invalid JSON arguments: ${toolCall.function.arguments}`;
  }

  switch (name) {
    case 'read_file': return toolReadFile(projectRoot, args);
    case 'write_file': return toolWriteFile(projectRoot, args);
    case 'patch_file': return toolPatchFile(projectRoot, args);
    case 'run_command': return toolRunCommand(projectRoot, args);
    case 'list_directory': return toolListDirectory(projectRoot, args);
    default: return `Error: Unknown tool: ${name}`;
  }
}

// ---------------------------------------------------------------------------
// LLM API call
// ---------------------------------------------------------------------------

async function callLLM(provider, messages) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        tools: TOOL_DEFINITIONS,
        ...(provider.useMaxCompletionTokens
          ? { max_completion_tokens: RUNNER_MAX_OUTPUT_TOKENS }
          : { max_tokens: RUNNER_MAX_OUTPUT_TOKENS }),
        stream: false,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`LLM API ${res.status}: ${body.slice(0, 500)}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Build issue prompt
// ---------------------------------------------------------------------------

function buildIssuePrompt(issue) {
  const lines = [
    `## Issue: ${issue.identifier} — ${issue.title}`,
    '',
  ];

  if (issue.description) {
    lines.push('### Description', '', issue.description, '');
  }

  const aiHints = (issue.comments?.nodes || [])
    .filter((c) => c.body.includes('AI Hint:') || c.body.includes('AI hint:'))
    .map((c) => c.body);
  if (aiHints.length > 0) {
    lines.push('### AI Hints', '', ...aiHints, '');
  }

  lines.push(
    '### Instructions',
    '',
    'Implement the changes described above. Follow these steps:',
    '1. Read relevant files to understand the current state',
    '2. Plan your changes',
    '3. Make the minimal necessary changes using write_file or patch_file',
    '4. Run run_typecheck to verify there are no type errors',
    '5. If there are type errors, fix them and run run_typecheck again',
    '6. Run run_lint to verify there are no lint errors or warnings',
    '7. If there are lint errors or warnings, fix them and run run_lint again',
    '8. Call task_complete with a summary of what you changed',
    '',
    'Keep changes minimal. Do not modify files unnecessarily.',
    'IMPORTANT: Always run run_typecheck AND run_lint before calling task_complete. Fix all errors and warnings first.',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main: run agent loop
// ---------------------------------------------------------------------------

export async function runAgent({ provider, issue, projectRoot, systemPrompt }) {
  const maxTurns = RUNNER_MAX_TURNS;
  const maxMs = RUNNER_MAX_EXECUTION_MS;
  const startTime = Date.now();

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: buildIssuePrompt(issue) },
  ];

  const filesChanged = new Set();
  let totalToolCalls = 0;
  let turn = 0;

  for (turn = 0; turn < maxTurns; turn++) {
    if (Date.now() - startTime > maxMs) {
      console.log(`[agent] Hard timeout reached (${maxMs}ms) at turn ${turn}`);
      return {
        completed: false,
        summary: 'Execution timed out',
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: true,
        error: null,
      };
    }

    console.log(`[agent] Turn ${turn + 1}/${maxTurns}`);

    let response;
    try {
      response = await callLLM(provider, messages);
    } catch (err) {
      console.error(`[agent] LLM call failed: ${err.message}`);
      return {
        completed: false,
        summary: `LLM call failed: ${err.message}`,
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: err.message,
      };
    }

    const choice = response.choices?.[0];
    if (!choice) {
      console.error('[agent] No choices in LLM response');
      return {
        completed: false,
        summary: 'No choices in LLM response',
        turns: turn,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: 'Empty LLM response',
      };
    }

    const msg = choice.message;

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      messages.push(msg);
      if (turn < maxTurns - 1) {
        console.log('[agent] No tool calls — prompting to continue');
        messages.push({
          role: 'user',
          content: 'Continue implementing the changes. Use the available tools to read and modify files. Call task_complete when done.',
        });
        continue;
      }
      break;
    }

    messages.push(msg);

    let taskCompleteResult = null;

    for (const toolCall of msg.tool_calls) {
      totalToolCalls++;
      const toolName = toolCall.function.name;

      if (toolName === 'task_complete') {
        try {
          taskCompleteResult = JSON.parse(toolCall.function.arguments);
        } catch {
          taskCompleteResult = { summary: toolCall.function.arguments };
        }
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: 'Task marked as complete.',
        });
        continue;
      }

      console.log(`[agent]   Tool: ${toolName}(${toolCall.function.arguments.slice(0, 100)}${toolCall.function.arguments.length > 100 ? '...' : ''})`);

      const result = executeTool(projectRoot, toolCall);

      if (toolName === 'write_file' || toolName === 'patch_file') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          if (args.path) filesChanged.add(args.path);
        } catch { /* ignore parse errors */ }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      });
    }

    if (taskCompleteResult) {
      console.log(`[agent] Task complete: ${taskCompleteResult.summary}`);
      return {
        completed: true,
        summary: taskCompleteResult.summary || 'No summary provided',
        turns: turn + 1,
        toolCalls: totalToolCalls,
        filesChanged: [...filesChanged],
        timedOut: false,
        error: null,
      };
    }

    const turnsRemaining = maxTurns - (turn + 1);
    if (turnsRemaining === RUNNER_TURN_BUDGET_WARNING) {
      console.log(`[agent] Turn budget warning: ${turnsRemaining} turns remaining`);
      messages.push({
        role: 'user',
        content: `⚠️ TURN BUDGET WARNING: You have only ${turnsRemaining} turns remaining out of ${maxTurns}. Stop making new changes immediately. Run run_typecheck and run_lint to verify your work, fix any errors, then call task_complete. Do not start any new modifications.`,
      });
    }
  }

  console.log(`[agent] Max turns (${maxTurns}) reached`);
  return {
    completed: false,
    summary: 'Max turns reached without task_complete',
    turns: turn,
    toolCalls: totalToolCalls,
    filesChanged: [...filesChanged],
    timedOut: false,
    error: null,
  };
}
