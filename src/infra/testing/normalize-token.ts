export function normalizeToken(value: string): string {
  const lower = value.trim().toLowerCase();
  let result = '';
  let prevDash = false;
  for (const ch of lower) {
    const isAlnum = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
    if (isAlnum) {
      result += ch;
      prevDash = false;
    } else if (!prevDash && result.length > 0) {
      result += '-';
      prevDash = true;
    }
  }
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
}
