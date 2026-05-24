import { PREFIXES } from "./model-prefixes.js";

export function shortName(n) { for (const [p,s] of PREFIXES) if (n.startsWith(p)) return s+n.slice(p.length); return n; }
