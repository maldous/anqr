#!/usr/bin/env node

const API_KEY = process.env.LINEAR_API_KEY;

const query = `
query AllIssues($first: Int!, $after: String) {
  issues(first: $first, after: $after) {
    nodes {
      id
      identifier
      title
      project { name }
      state { name type }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

async function fetchPage(after = null) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { first: 100, after },
    }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data.issues;
}

async function main() {
  let after = null;
  const all = [];

  while (true) {
    const page = await fetchPage(after);
    all.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }

  console.log(JSON.stringify({ total: all.length, issues: all }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
