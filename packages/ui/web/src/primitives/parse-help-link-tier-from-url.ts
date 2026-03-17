import type { Tier } from "@/lib/tier";

export function parseTierFromUrl(href: string): Tier | undefined {
  const regex = /[?&]tab=(basic|advanced|professional)(?:&|#|$)/;
  const match = regex.exec(href);
  return match ? (match[1] as Tier) : undefined;
}
