export const formatDecoderMaskPattern = (maskPattern: number | null) => {
  if (maskPattern === null) return <span className="text-amber-500">— (not detected)</span>;
  return `${maskPattern}`;
};
