// Generated from ../../scripts/ops/linear-all.mjs:27

export const query = `
query BacklogCount($after: String) {
  issues(
    first: 250
    after: $after
    filter: {
      state: { type: { eq: "backlog" } }
    }
  ) {
    nodes {
      id
      identifier
      team { name }
      project { name }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;
