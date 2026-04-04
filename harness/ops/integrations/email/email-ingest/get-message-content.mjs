import { extractTextContent } from "./extract-text-content.mjs";
import { run } from "./run.mjs";

export function getMessageContent(messageId) {
  const proc = run("notmuch", ["show", "--format=json", "--entire-thread=false", "--", messageId]);
  if (proc.status !== 0) return null;
  try {
    const data = JSON.parse(proc.stdout);
    // notmuch show --format=json returns: [[{thread: {0: msg, 1: msg}}, ...], []]
    // The message is at data[0]['0']['0']
    if (!data || !data[0] || !data[0]["0"] || !data[0]["0"]["0"]) {
      return null;
    }
    const msg = data[0]["0"]["0"];
    return {
      id: msg.id,
      subject: msg.headers?.Subject || "",
      from: msg.headers?.From || "",
      to: msg.headers?.To || "",
      date: msg.headers?.Date || "",
      timestamp: msg.timestamp || 0,
      body: extractTextContent(msg.body || []),
      tags: msg.tags || [],
    };
  } catch {
    return null;
  }
}
