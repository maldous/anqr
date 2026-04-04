export function colorToEmoji(color) {
  if (color === 0x00ff00) return "🟢";
  if (color === 0xff0000) return "🔴";
  if (color === 0xffa500) return "🟠";
  return "";
}
