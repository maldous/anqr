export const formatDecoderNumBits = (numBits: number | null) => {
  if (numBits === null) return <span className="text-muted-foreground">N/A</span>;
  return `${numBits} bits`;
};
