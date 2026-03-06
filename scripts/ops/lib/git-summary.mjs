import { execSync } from 'node:child_process';

/**
 * Return a compact summary of the current git working tree.
 *
 * @param {string} projectRoot  Absolute path used as cwd for git commands.
 * @returns {{ branch: string, head: string, status: string }}
 */
export function gitSummary(projectRoot) {
  let branch = 'unknown';
  let head = 'unknown';
  let status = 'clean';
  try {
    branch = execSync('git branch --show-current', { cwd: projectRoot, encoding: 'utf8' }).trim();
    head = execSync('git rev-parse --short HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim();
    const porcelain = execSync('git status --short', {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
    status = porcelain ? `dirty (${porcelain.split('\n').length} files changed)` : 'clean';
  } catch {
    // noop
  }
  return { branch, head, status };
}
