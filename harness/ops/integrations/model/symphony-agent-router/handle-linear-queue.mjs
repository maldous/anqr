import { json } from "./json.mjs";
import { linearQueue } from "./linear-queue.mjs";
import { logInfo } from "./logger.mjs";

export function handleLinearQueue(req, res) {
  // POST /v1/linear/queue - add event to queue
  if (req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const event = JSON.parse(Buffer.concat(chunks).toString());
        linearQueue.enqueue({
          ...event,
          queuedAt: new Date().toISOString(),
        });
        logInfo(`Queued Linear event: ${event.event?.identifier}`);
        return json(res, 202, { status: "queued", queueLength: linearQueue.length });
      } catch (err) {
        return json(res, 400, { error: { message: `Invalid JSON: ${err.message}` } });
      }
    });
    return;
  }

  // GET /v1/linear/queue - get queue status
  if (req.method === "GET") {
    return json(res, 200, {
      queueLength: linearQueue.length,
      events: linearQueue
        .items()
        .slice(-10)
        .map((e) => ({
          identifier: e.event?.identifier,
          action: e.event?.action,
          queuedAt: e.queuedAt,
        })),
    });
  }

  // DELETE /v1/linear/queue - clear queue
  if (req.method === "DELETE") {
    const cleared = linearQueue.length;
    linearQueue.clear();
    return json(res, 200, { status: "cleared", clearedCount: cleared });
  }

  json(res, 405, { error: { message: "Method not allowed" } });
}
