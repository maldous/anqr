import { AdUnit } from "@/platform/ads/components/ad-unit";

export function HorizontalAd({ slot }: Readonly<{ slot: string }>) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex justify-center">
        <AdUnit slot={slot} width={728} height={90} format="horizontal" />
      </div>
    </div>
  );
}
