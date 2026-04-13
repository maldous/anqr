export function sseEvent(res, eventType, data) {
  res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
}
