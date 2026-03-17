import type { TFunction } from "i18next";
import { HighlightedLabel } from "../../../search/search-context";
import { DynamicTestId } from "../../../../../lib/dynamic-testid";
import { isValidSSID } from "../../../../../../../../packages/domain/payload/src/payload-generators";
import type { QRState } from "../../../../../state/qr-store";
import { Input } from "../../../../../../../../packages/ui/web/src/primitives/input";
import { Label } from "../../../../../../../../packages/ui/web/src/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../packages/ui/web/src/primitives/select";
import { Switch } from "../../../../../../../../packages/ui/web/src/primitives/switch";

export const WifiEditor = ({
  payload,
  setPayloadWifi,
  t,
}: Readonly<{
  payload: QRState["payload"];
  setPayloadWifi: QRState["setPayloadWifi"];
  t: TFunction;
}>) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.ssid")}</HighlightedLabel>
        </Label>
        <Input
          value={payload.wifi.ssid}
          onChange={(e) => setPayloadWifi({ ssid: e.target.value })}
          placeholder="MyWiFiNetwork"
          data-testid={DynamicTestId.resolve("payload-wifi-ssid-input", "payload-wifi-ssid-input")}
          className={
            payload.validate && payload.wifi.ssid && !isValidSSID(payload.wifi.ssid)
              ? "border-destructive focus-visible:ring-destructive"
              : ""
          }
        />
        {payload.validate && payload.wifi.ssid && !isValidSSID(payload.wifi.ssid) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidSSID", "SSID must be 1-32 characters")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          <HighlightedLabel>{t("payload.securityType")}</HighlightedLabel>
        </Label>
        <Select
          value={payload.wifi.auth}
          onValueChange={(value) => setPayloadWifi({ auth: value as typeof payload.wifi.auth })}
        >
          <SelectTrigger
            data-testid={DynamicTestId.resolve(
              "payload-wifi-auth-select",
              "payload-wifi-auth-select",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2</SelectItem>
            <SelectItem value="WPA2">WPA2</SelectItem>
            <SelectItem value="WPA3">WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">{t("payload.openNoPassword")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {payload.wifi.auth !== "nopass" && (
        <div className="space-y-2">
          <Label>
            <HighlightedLabel>{t("payload.password")}</HighlightedLabel>
          </Label>
          <Input
            type="password"
            value={payload.wifi.password || ""}
            onChange={(e) => setPayloadWifi({ password: e.target.value })}
            placeholder={t("placeholders.networkPassword")}
            data-testid={DynamicTestId.resolve(
              "payload-wifi-password-input",
              "payload-wifi-password-input",
            )}
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>
          <HighlightedLabel>{t("payload.hidden")}</HighlightedLabel>
        </Label>
        <Switch
          checked={payload.wifi.hidden}
          onCheckedChange={(checked) => setPayloadWifi({ hidden: checked })}
          data-testid={DynamicTestId.resolve(
            "payload-wifi-hidden-switch",
            "payload-wifi-hidden-switch",
          )}
        />
      </div>
    </div>
  );
};
