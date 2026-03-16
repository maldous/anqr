import { isDark } from "./is-dark";
import type { RGB } from "../../../modules/core/types";

export function getTextColor(background: string | RGB): "#000000" | "#ffffff" {
  return isDark(background) ? "#ffffff" : "#000000";
}
