export function fetchCommits() {
  try {
    const out = execSync(
      'git log --oneline --max-count=10 --format="%h %s" --no-color',
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 5000 },
    );
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, ...rest] = line.split(" ");
        return { hash, subject: rest.join(" ") };
      });
  } catch (err) {
    console.error(`[status-server] git log failed: ${err.message}`);
    return [];
  }
}