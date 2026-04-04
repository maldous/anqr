export const PRIORITY_RULES = [
  [/^(?:harness|scripts)\/ops\//i, 0],
  [/^packages\//i, 1],
  [/^apps\/(?:api|mobile|web)\/src\//i, 2],
  [/^apps\/web\//i, 3],
  [/^apps\/api\//i, 3],
  [/^apps\/mobile\//i, 3],
  [/^apps\/android\//i, 4],
  [/^apps\/ios\//i, 4],
  [/^docs\/harness\//i, 5],
  [/^docs\//i, 6],
  [/^[^./]+(?:\.md)?$/i, 7],
];
