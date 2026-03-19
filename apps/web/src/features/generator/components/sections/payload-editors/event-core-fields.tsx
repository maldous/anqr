import { DateTimePicker, Input, Label, Textarea } from "@/ui/web";
import type { TFunction } from "i18next";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { HighlightedLabel } from "../../../search/search-context";

export function EventCoreFields({
  summary,
  location,
  description,
  start,
  end,
  onSummaryChange,
  onLocationChange,
  onDescriptionChange,
  onStartChange,
  onEndChange,
  summaryPlaceholder,
  locationPlaceholder,
  summaryTestId,
  locationTestId,
  descriptionTestId,
  startTestId,
  endTestId,
  t,
}: Readonly<{
  summary: string;
  location: string;
  description: string;
  start: string;
  end: string;
  onSummaryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  summaryPlaceholder: string;
  locationPlaceholder: string;
  summaryTestId: string;
  locationTestId: string;
  descriptionTestId: string;
  startTestId: string;
  endTestId: string;
  t: TFunction;
}>) {
  return (
    <>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.summary")}</HighlightedLabel>
        </Label>
        <Input
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder={summaryPlaceholder}
          data-testid={DynamicTestId.resolve(summaryTestId, summaryTestId)}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.location")}</HighlightedLabel>
        </Label>
        <Input
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder={locationPlaceholder}
          data-testid={DynamicTestId.resolve(locationTestId, locationTestId)}
        />
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.description")}</HighlightedLabel>
        </Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("placeholders.eventDetails")}
          rows={2}
          data-testid={DynamicTestId.resolve(descriptionTestId, descriptionTestId)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t("payload.start")}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={start}
            onChange={onStartChange}
            placeholder={t("placeholders.selectDateTime", "Select date & time")}
            data-testid={DynamicTestId.resolve(startTestId, startTestId)}
          />
        </div>
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t("payload.end")}</HighlightedLabel>
          </Label>
          <DateTimePicker
            value={end}
            onChange={onEndChange}
            placeholder={t("placeholders.selectDateTime", "Select date & time")}
            data-testid={DynamicTestId.resolve(endTestId, endTestId)}
          />
        </div>
      </div>
    </>
  );
}
