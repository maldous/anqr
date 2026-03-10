#!/usr/bin/env node

/**
 * List and delete error/retry comments from Linear issues.
 *
 * Identifies noise comments (error traces, retry logs, stale workpads) and
 * optionally deletes them. Dry-run by default — use --apply to delete.
 *
 * Usage:
 *   node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106
 *   node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --apply
 *   node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --format json
 *   node scripts/ops/linear-cleanup-comments.mjs --all-open --apply
 *   node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --older-than 7
 *   node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --pattern "timeout|ECONNRESET"
 *
 * Options:
 *   --issue <ID>          Target a specific issue (e.g. ANQ-106)
 *   --all-open            Scan all non-terminal issues
 *   --apply               Actually delete matched comments (dry-run without this)
 *   --pattern <regex>     Additional regex pattern to match (combined with built-in patterns)
 *   --older-than <days>   Only match comments older than N days
 *   --format <fmt>        Output format: table (default) or json
 *   -h, --help            Show this help text
 *
 * Requires: LINEAR_API_KEY environment variable.
 *
 * Built-in noise patterns (always applied):
 *   - Error stack traces (Error:, TypeError:, at Object., etc.)
 *   - Agent retry/failure messages (retry, attempt, failed, ENOENT, ECONNRESET)
 *   - HTTP error codes in context (HTTP 4xx, HTTP 5xx, status 429)
 *   - Dismissive one-liners ("Resolved. Continue", "Done.")
 *   - Symphony/Codex crash traces
 *
 * Protected patterns (never deleted):
 *   - Evidence comments (commit hashes, PASS/FAIL verdicts)
 *   - AI Hint: comments
 *   - Board hygiene audit comments
 */

import { createGql } from './lib/linear-client.mjs';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';

const TERMINAL_STATES = new Set(['done', 'closed', 'cancelled', 'canceled', 'duplicate']);

// --- Noise patterns: comments matching ANY of these are candidates for deletion ---
const NOISE_PATTERNS = [
  // Stack traces
  /^Error:|^TypeError:|^SyntaxError:|^ReferenceError:/m,
  /at\s+(?:Object\.|Module\.|async\s|processTicksAndRejections)/m,
  /\bENOENT\b|\bECONNRESET\b|\bECONNREFUSED\b|\bETIMEDOUT\b|\bEPIPE\b/,
  // HTTP errors in agent context
  /HTTP\s+[45]\d{2}|status\s*[:=]\s*[45]\d{2}|\b429\b.*(?:rate|limit|throttl)/i,
  // Agent retry/failure noise
  /\b(?:attempt|retry)\s+\d+\s*(?:of|\/)\s*\d+/i,
  /failed after \d+ retries/i,
  /\bExited with code [1-9]/i,
  /\bTerminated at \d+/i,
  /\bcommand failed|process exited|non-zero exit/i,
  // Symphony/Codex crash noise
  /codex.*(?:crash|abort|killed|timeout)/i,
  /symphony.*(?:drain|overflow|circuit.?breaker)/i,
  /provider.*(?:exhausted|unavailable|cooldown)/i,
  // Dismissive one-liners (< 50 chars, no substance)
  /^(?:Resolved\.?\s*Continue\.?|Done\.?|Fixed\.?|Closed\.?|Completed\.?)\s*$/im,
];

// --- Protected patterns: comments matching ANY of these are NEVER deleted ---
const PROTECTED_PATTERNS = [
  // Evidence comments
  /\b[0-9a-f]{7,40}\b.*(?:commit|files? changed|validation)/i,
  /\b(?:PASS|FAIL)\b/,
  /\bEvidence:/i,
  /Board hygiene audit:/i,
  // AI Hints
  /^AI Hint:/m,
  // Workpad headers (preserve consolidated workpads)
  /^##\s+Codex Workpad/m,
  // Human-authored instructions
  /Unblock steps:/i,
  /Acceptance Criteria/i,
];

const HELP_TEXT = `List and delete error/retry comments from Linear issues.

Usage:
  node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106
  node scripts/ops/linear-cleanup-comments.mjs --issue ANQ-106 --apply
  node scripts/ops/linear-cleanup-comments.mjs --all-open
  node scripts/ops/linear-cleanup-comments.mjs --all-open --apply --older-than 7

Options:
  --issue <ID>          Target a specific issue (e.g. ANQ-106)
  --all-open            Scan all non-terminal issues
  --apply               Actually delete matched comments (dry-run without this)
  --pattern <regex>     Additional regex pattern to match
  --older-than <days>   Only match comments older than N days
  --format <fmt>        Output format: table (default) or json
  -h, --help            Show this help text

Requires: LINEAR_API_KEY environment variable.
`;

function parseArgs(argv) {
  const args = { format: 'table' };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--issue':
        args.issue = value;
        i += 2;
        break;
      case '--all-open':
        args.allOpen = true;
        i += 1;
        break;
      case '--apply':
        args.apply = true;
        i += 1;
        break;
      case '--pattern':
        args.pattern = value;
        i += 2;
        break;
      case '--older-than':
        args.olderThanDays = Number(value);
        i += 2;
        break;
      case '--format':
        args.format = value;
        i += 2;
        break;
      case '--help':
      case '-h':
        args.help = true;
        i += 1;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        console.error('Use --help to view available options.');
        process.exit(1);
    }
  }
  return args;
}

function isNoiseComment(body, extraPattern) {
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(body)) return true;
  }
  if (extraPattern && extraPattern.test(body)) return true;
  return false;
}

function isProtectedComment(body) {
  for (const pattern of PROTECTED_PATTERNS) {
    if (pattern.test(body)) return true;
  }
  return false;
}

function classifyComment(body, extraPattern) {
  if (isProtectedComment(body)) return 'protected';
  if (isNoiseComment(body, extraPattern)) return 'noise';
  return 'keep';
}

function truncate(text, maxLen) {
  const oneLine = text.replace(/\n/g, ' ').trim();
  if (oneLine.length <= maxLen) return oneLine;
  return oneLine.slice(0, maxLen - 3) + '...';
}

async function fetchIssueComments(gql, issueIdentifier) {
  const issueData = await gql(
    `query($id: String!) {
      issue(id: $id) {
        id
        identifier
        title
        comments(first: 100) {
          nodes {
            id
            body
            createdAt
            updatedAt
            user { name }
          }
        }
      }
    }`,
    { id: issueIdentifier }
  );
  return issueData.issue;
}

async function fetchAllOpenIssueIdentifiers(gql, teamKey) {
  const identifiers = [];
  let hasMore = true;
  let cursor = null;

  while (hasMore) {
    const result = await gql(
      `query($teamKey: String!, $after: String) {
        team(id: $teamKey) {
          issues(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { identifier state { name } }
          }
        }
      }`,
      { teamKey, after: cursor }
    );

    if (!result.team) {
      console.error(`ERROR: Team '${teamKey}' not found`);
      process.exit(1);
    }

    const page = result.team.issues;
    for (const issue of page.nodes) {
      if (!TERMINAL_STATES.has(issue.state.name.toLowerCase())) {
        identifiers.push(issue.identifier);
      }
    }
    hasMore = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return identifiers;
}

async function deleteComment(gql, commentId) {
  const result = await gql(
    `mutation($id: String!) {
      commentDelete(id: $id) { success }
    }`,
    { id: commentId }
  );
  return result.commentDelete?.success ?? false;
}

async function processIssue(gql, issueIdentifier, args, extraPattern, cutoffDate) {
  const issue = await fetchIssueComments(gql, issueIdentifier);
  if (!issue) {
    console.error(`WARNING: Issue ${issueIdentifier} not found, skipping`);
    return { issueId: issueIdentifier, comments: [], deleted: 0, skipped: 0, protected: 0 };
  }

  const comments = issue.comments.nodes;
  const results = [];
  let deleted = 0;
  let skipped = 0;
  let protectedCount = 0;

  for (const comment of comments) {
    const body = comment.body || '';
    const createdAt = new Date(comment.createdAt);
    const author = comment.user?.name ?? 'unknown';
    const classification = classifyComment(body, extraPattern);

    // Apply age filter
    if (cutoffDate && createdAt > cutoffDate) {
      if (classification === 'noise') {
        skipped++;
        results.push({
          id: comment.id,
          classification: 'noise-recent',
          author,
          createdAt: comment.createdAt,
          preview: truncate(body, 80),
          action: 'skip (too recent)',
        });
        continue;
      }
    }

    if (classification === 'protected') {
      protectedCount++;
      results.push({
        id: comment.id,
        classification: 'protected',
        author,
        createdAt: comment.createdAt,
        preview: truncate(body, 80),
        action: 'keep (protected)',
      });
      continue;
    }

    if (classification === 'noise') {
      if (args.apply) {
        const success = await deleteComment(gql, comment.id);
        deleted++;
        results.push({
          id: comment.id,
          classification: 'noise',
          author,
          createdAt: comment.createdAt,
          preview: truncate(body, 80),
          action: success ? 'DELETED' : 'DELETE FAILED',
        });
      } else {
        results.push({
          id: comment.id,
          classification: 'noise',
          author,
          createdAt: comment.createdAt,
          preview: truncate(body, 80),
          action: 'would delete (dry-run)',
        });
      }
      continue;
    }

    // classification === 'keep'
    results.push({
      id: comment.id,
      classification: 'keep',
      author,
      createdAt: comment.createdAt,
      preview: truncate(body, 80),
      action: 'keep',
    });
  }

  return {
    issueId: issue.identifier,
    title: issue.title,
    totalComments: comments.length,
    comments: results,
    deleted,
    skipped,
    protected: protectedCount,
    noiseCount: results.filter((r) => r.classification === 'noise' || r.classification === 'noise-recent').length,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (!LINEAR_API_KEY) {
    console.error('ERROR: LINEAR_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!args.issue && !args.allOpen) {
    console.error('ERROR: --issue <ID> or --all-open is required');
    process.exit(1);
  }

  const gql = createGql(LINEAR_API_KEY);

  const extraPattern = args.pattern ? new RegExp(args.pattern, 'i') : null;
  const cutoffDate = args.olderThanDays
    ? new Date(Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000)
    : null;

  // Collect issue identifiers to process
  let issueIds;
  if (args.allOpen) {
    issueIds = await fetchAllOpenIssueIdentifiers(gql, 'ANQ');
    console.error(`Scanning ${issueIds.length} open issues...`);
  } else {
    issueIds = [args.issue];
  }

  const allResults = [];
  let totalDeleted = 0;
  let totalNoise = 0;

  for (const id of issueIds) {
    const result = await processIssue(gql, id, args, extraPattern, cutoffDate);
    if (result.noiseCount > 0 || result.comments.length > 0) {
      allResults.push(result);
    }
    totalDeleted += result.deleted;
    totalNoise += result.noiseCount;
  }

  // Output
  if (args.format === 'json') {
    console.log(JSON.stringify(allResults, null, 2));
  } else {
    for (const result of allResults) {
      const noiseComments = result.comments.filter(
        (c) => c.classification === 'noise' || c.classification === 'noise-recent'
      );
      if (noiseComments.length === 0 && args.allOpen) continue;

      console.log(`\n${result.issueId} — ${result.title || '(untitled)'} (${result.totalComments} comments)`);
      console.log('-'.repeat(90));

      if (result.comments.length === 0) {
        console.log('  (no comments)');
        continue;
      }

      for (const c of result.comments) {
        const date = c.createdAt.slice(0, 10);
        const tag = c.classification === 'noise'
          ? '[DEL] '
          : c.classification === 'noise-recent'
            ? '[NEW] '
            : c.classification === 'protected'
              ? '[OK]  '
              : '      ';
        console.log(`  ${tag} ${date}  ${c.author.padEnd(16)} ${c.action.padEnd(24)} ${c.preview}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(90));
    if (args.apply) {
      console.log(`Deleted ${totalDeleted} noise comments across ${allResults.length} issues.`);
    } else {
      console.log(`Found ${totalNoise} noise comments across ${allResults.length} issues.`);
      if (totalNoise > 0) {
        console.log('Run with --apply to delete them.');
      }
    }
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
