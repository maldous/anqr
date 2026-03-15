export type TextTokenMatch =
  | { kind: 'url'; start: number; end: number; value: string }
  | { kind: 'wiki'; start: number; end: number; href: string; label: string };
