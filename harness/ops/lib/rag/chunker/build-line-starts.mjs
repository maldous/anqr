export function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.codePointAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}
