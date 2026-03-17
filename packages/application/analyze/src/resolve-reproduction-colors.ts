export function resolveColors(
  isGeneratorSource: boolean,
  renderState: { fgColor: string; bgColor: string; bgTransparent: boolean },
  detectedColors: { foreground: string; background: string } | null,
) {
  return {
    fg: isGeneratorSource ? renderState.fgColor : detectedColors?.foreground || "#000000",
    bg: (() => {
      if (!isGeneratorSource) return detectedColors?.background || "#ffffff";
      return renderState.bgTransparent ? "#ffffff" : renderState.bgColor;
    })(),
  };
}
