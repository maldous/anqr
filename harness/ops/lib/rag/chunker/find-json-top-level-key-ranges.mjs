export function findJsonTopLevelKeyRanges(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const keys = Object.keys(parsed);
    if (keys.length <= 1) return null;

    const lines = text.split("\n");
    const keyLineIndices = [];
    let searchFrom = 0;

    for (const key of keys) {
      const escaped = key.replaceAll(/[.*+?^${}()|[\]\]/g, "\$&");
      const matcher = new RegExp(`^\s*"${escaped}"\s*:`);
      let found = -1;

      for (let i = searchFrom; i < lines.length; i++) {
        if (matcher.test(lines[i])) {
          found = i;
          searchFrom = i + 1;
          break;
        }
      }

      if (found === -1) {
        return null;
      }

      keyLineIndices.push(found);
    }

    return { lines, keyLineIndices };
  } catch {
    return null;
  }
}
