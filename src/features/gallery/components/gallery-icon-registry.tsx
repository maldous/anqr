import { iconRegistry } from "./icon-registry";
import type { DynamicIconProps } from "./dynamic-icon.types";

export function DynamicIcon({ name, className }: DynamicIconProps) {
  const Icon = iconRegistry[name];
  return Icon ? <Icon className={className} /> : null;
}
