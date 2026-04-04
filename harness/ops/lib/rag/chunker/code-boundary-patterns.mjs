export const CODE_BOUNDARY_PATTERNS = [
  /^export\s+(?:default\s+)?(?:async\s+)?function\b/,
  /^export\s+(?:default\s+)?(?:abstract\s+)?class\b/,
  /^(?:async\s+)?function\s+[A-Za-z_$][\w$]*/,
  /^(?:abstract\s+)?class\s+[A-Za-z_$][\w$]*/,
  /^export\s+(?:interface|type|enum)\b/,
  /^(?:interface|type|enum)\s+[A-Za-z_$][\w$]*/,
  /^export\s+(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/,
  /^(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:\(|[A-Za-z_$][\w$]*\s*=>)/,
  /^export\s+default\s+/,
  /^(?:describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*\(/,
];
