import { Input, Label } from "@/ui/web";

export function CityAmountFields({
  cityLabel,
  cityPlaceholder,
  cityValue,
  onCityChange,
  amountLabel,
  amountPlaceholder,
  amountValue,
  onAmountChange,
}: Readonly<{
  cityLabel: string;
  cityPlaceholder: string;
  cityValue: string;
  onCityChange: (value: string) => void;
  amountLabel: string;
  amountPlaceholder: string;
  amountValue: string;
  onAmountChange: (value: string) => void;
}>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>{cityLabel}</Label>
        <Input
          placeholder={cityPlaceholder}
          value={cityValue}
          onChange={(e) => onCityChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{amountLabel}</Label>
        <Input
          type="number"
          placeholder={amountPlaceholder}
          value={amountValue}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>
    </div>
  );
}
