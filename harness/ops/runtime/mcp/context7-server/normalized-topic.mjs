export function normalizedTopic(topic, libraryTitle) {
  if (topic && String(topic).trim()) return String(topic).trim();
  return `Documentation and examples for ${libraryTitle}`;
}
