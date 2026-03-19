import { isDark } from "./is-dark";
import type { RGB } from "@/domain/share";

export function getTextColor(background: string | RGB): "#000000" | "#ffffff" {
  return isDark(background) ? "#ffffff" : "#000000";
}
