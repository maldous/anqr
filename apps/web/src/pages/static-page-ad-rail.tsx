import { AdUnit } from "../../../../packages/analytics/ads/src/components/ad-unit";

export function StaticPageAdRail({
  slot,
  hiddenClassName,
  paddingClassName,
}: Readonly<{
  slot: "static-left" | "static-right";
  hiddenClassName: string;
  paddingClassName: string;
}>) {
  return (
    <div
      className={`${hiddenClassName} flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 ${paddingClassName}`}
    >
      <AdUnit slot={slot} width={160} height={600} format="vertical" />
    </div>
  );
}
