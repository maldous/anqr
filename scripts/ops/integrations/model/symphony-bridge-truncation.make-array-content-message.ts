export function makeArrayContentMessage(
  role: string,
  parts: Array<{ type: string; text?: string; result?: string }>,
): { role: string; content: Array<{ type: string; text?: string; result?: string }> } {
  return { role, content: parts };
}
