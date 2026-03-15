export function parseHalftoneCell(cellConfig: number | string | undefined): number {
  if (cellConfig === undefined || cellConfig === 'per_module') return 1;
  if (typeof cellConfig === 'number') return Math.max(1, Math.round(cellConfig));

  const match = /^(\d+)[x×](\d+)$/i.exec(String(cellConfig));
  if (match) {
    return Math.max(1, Number.parseInt(match[1], 10));
  }

  return 1;
}
