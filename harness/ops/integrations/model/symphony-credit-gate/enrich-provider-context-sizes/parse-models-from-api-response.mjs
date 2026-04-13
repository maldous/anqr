export function parseModelsFromApiResponse(body) {
  if (!body) return [];
  // OpenAI-style: { data: [...] }
  if (Array.isArray(body?.data)) return body.data;
  // Direct array
  if (Array.isArray(body)) return body;
  // Mistral-style: { object: "list", data: [...] }
  if (Array.isArray(body?.models)) return body.models;
  return [];
}
