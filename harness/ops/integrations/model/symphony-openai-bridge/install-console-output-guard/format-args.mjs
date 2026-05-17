import { inspect } from "node:util";
import { summarize } from "./summarize.mjs";

const MAX_ITEMS = 8;
const MAX_STRING = 240;

export function formatArgs(args) {
  return args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      return inspect(summarize(arg), {
        depth: 3,
        breakLength: 140,
        maxArrayLength: MAX_ITEMS,
        maxStringLength: MAX_STRING,
        colors: false,
        compact: true,
      });
    })
    .join(" ");
}
