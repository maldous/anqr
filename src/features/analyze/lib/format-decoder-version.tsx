export const formatDecoderVersion = (version: number | null) => {
  if (version === null) return <span className="text-red-500">— (not detected)</span>;
  return `${version} (${version * 4 + 17}×${version * 4 + 17})`;
};
