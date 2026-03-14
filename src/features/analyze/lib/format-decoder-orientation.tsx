export const formatDecoderOrientation = (orientation: number | null) => {
  if (orientation !== null && orientation !== 0) return `${orientation}°`;
  return <span className="text-muted-foreground">Standard (0°)</span>;
};
