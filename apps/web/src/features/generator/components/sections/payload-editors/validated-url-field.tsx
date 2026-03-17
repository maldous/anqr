import { HighlightedLabel } from "../../../search/search-context";
import { isValidUrl } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";

export function ValidatedUrlField({
  label,
  value,
  onChange,
  placeholder,
  validate,
  invalidMessage,
  type = "url",
  title,
  dataTestId,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  validate: boolean;
  invalidMessage: string;
  type?: "url" | "text";
  title?: string;
  dataTestId?: string;
}>) {
  const isInvalid = validate && value && !isValidUrl(value);

  return (
    <div className="space-y-2">
      <Label>
        <HighlightedLabel>{label}</HighlightedLabel>
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        title={title}
        data-testid={dataTestId}
        className={isInvalid ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {isInvalid && <p className="text-xs text-destructive">{invalidMessage}</p>}
    </div>
  );
}
