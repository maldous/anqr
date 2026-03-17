export function forEachFoldedLine(
  payload: string,
  visit: (baseKey: string, keyPart: string, value: string, line: string) => void,
) {
  const lines = payload.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      i++;
      line += lines[i].slice(1);
    }
    i++;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = keyPart.split(";")[0];
    visit(baseKey, keyPart, value, line);
  }
}
