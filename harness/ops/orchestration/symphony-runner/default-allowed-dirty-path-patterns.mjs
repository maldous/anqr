export const DEFAULT_ALLOWED_DIRTY_PATH_PATTERNS = [
  /^reports\/rag-index\//,
  /^reports\/symphony\/state\.json(?:\.lock)?$/,
  /^reports\/runtime-events\.log$/,
  /^reports\/notify\//,
  /^reports\/email-ingest\//,
  /^reports\/codebuff\//,
  /^reports\/doctor\.json$/,
  /^reports\/latest\.json$/,
  /^task_requests\/tasks\//,
  // Bridge server runtime files — modified on every AI request
  /^harness\/ops\/runtime\/openclaw-config\/canvas\//,
  /^harness\/ops\/runtime\/openclaw-config\/identity\//,
  /^\.gitignore$/,
];
