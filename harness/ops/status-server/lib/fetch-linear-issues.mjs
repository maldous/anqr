export async function fetchLinearIssues() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return [];
  const query = `query { issues(filter:{team:{id:{eq:"01534c1e-4041-474d-a81e-24f917f33912"}},state:{type:{eq:"started"}}},first:20,orderBy:updatedAt) { nodes { identifier title url priority state{name type} assignee{name} updatedAt estimate labels{nodes{name color}} } } }`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({ query }), signal: controller.signal,
    });
    clearTimeout(t);
    const body = await res.json();
    return body?.data?.issues?.nodes || [];
  } catch { return []; }
}
