import { GALLERY_ICON_MAP } from './gallery-icon-map';

export function DynamicIcon({ name, className }: Readonly<{ name: string; className?: string }>) {
  const Icon = GALLERY_ICON_MAP[name];
  return Icon ? <Icon className={className} /> : null;
}
