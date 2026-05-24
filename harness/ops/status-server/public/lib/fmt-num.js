export function fmtNum(n) { if (n == null || Number.isNaN(n)) return "—"; return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n); }
