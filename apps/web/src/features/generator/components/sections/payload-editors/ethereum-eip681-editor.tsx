import { isValidEthereumAddress } from "@/application/generator";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/web";
import type { TFunction } from "i18next";
import type { QRState } from "../../../../../state/qr-store";
import type { EthereumForm } from "../payload-section-types";

export const EthereumEip681Editor = ({
  ethereumForm,
  payload,
  setEthereumForm,
  t,
}: Readonly<{
  ethereumForm: EthereumForm;
  payload: QRState["payload"];
  setEthereumForm: React.Dispatch<React.SetStateAction<EthereumForm>>;
  t: TFunction;
}>) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>{t("payload.walletAddress")}</Label>
      <Input
        placeholder={t("placeholders.ethAddressPlaceholder")}
        className={`font-mono ${
          payload.validate &&
          ethereumForm.targetAddress &&
          !isValidEthereumAddress(ethereumForm.targetAddress)
            ? "border-destructive focus-visible:ring-destructive"
            : ""
        }`}
        value={ethereumForm.targetAddress}
        onChange={(e) => setEthereumForm({ ...ethereumForm, targetAddress: e.target.value })}
      />
      {payload.validate &&
        ethereumForm.targetAddress &&
        !isValidEthereumAddress(ethereumForm.targetAddress) && (
          <p className="text-xs text-destructive">
            {t("validation.invalidEthereumAddress", "Enter a valid Ethereum address (0x...)")}
          </p>
        )}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>{t("placeholders.chainId")}</Label>
        <Select
          value={ethereumForm.chainId}
          onValueChange={(v) => setEthereumForm({ ...ethereumForm, chainId: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("placeholders.ethMainnet")}</SelectItem>
            <SelectItem value="137">{t("placeholders.polygon")}</SelectItem>
            <SelectItem value="56">{t("placeholders.bsc")}</SelectItem>
            <SelectItem value="43114">{t("placeholders.avalanche")}</SelectItem>
            <SelectItem value="42161">{t("placeholders.arbitrum")}</SelectItem>
            <SelectItem value="10">{t("placeholders.optimism")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>
          {t("placeholders.valueWei")} {t("common.optional")}
        </Label>
        <Input
          placeholder={t("placeholders.weiPlaceholder")}
          value={ethereumForm.value}
          onChange={(e) => setEthereumForm({ ...ethereumForm, value: e.target.value })}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label>
        {t("placeholders.gasLimitOptional")} {t("common.optional")}
      </Label>
      <Input
        type="number"
        placeholder={t("placeholders.gasPlaceholder")}
        value={ethereumForm.gas}
        onChange={(e) => setEthereumForm({ ...ethereumForm, gas: e.target.value })}
      />
    </div>
    <p className="text-xs text-muted-foreground">{t("placeholders.eip681Hint")}</p>
  </div>
);
