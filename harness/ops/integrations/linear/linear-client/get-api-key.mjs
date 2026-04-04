export function getApiKey() {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("LINEAR_API_KEY environment variable is not set");
  return key;
}
