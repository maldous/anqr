import { EMV_TAGS, MAI_SUBTAGS, POI_METHOD } from "./payload-generators/types";
import { crc16CCITT, utf8ByteLength } from "./payload-generators/utils";

/**
 * EMV QR Code Builder class for Merchant-Presented Mode
 */
export class EMVQRBuilder {
  private readonly fields: Map<string, string> = new Map();

  static encodeTLV(tag: string, value: string): string {
    if (!value?.length) return "";
    const paddedTag = tag.padStart(2, "0");
    const byteLength = utf8ByteLength(value);
    if (byteLength > 99) {
      throw new Error(
        `EMV TLV value for tag ${paddedTag} exceeds 99 bytes (${byteLength} bytes). ` +
          `Please shorten the value.`,
      );
    }
    const length = byteLength.toString().padStart(2, "0");
    return `${paddedTag}${length}${value}`;
  }

  static buildTemplate(fields: Array<{ tag: string; value: string }>): string {
    return fields
      .filter((f) => f.value && f.value.length > 0)
      .map((f) => EMVQRBuilder.encodeTLV(f.tag, f.value))
      .join("");
  }

  setPayloadFormatIndicator(): this {
    this.fields.set(EMV_TAGS.PAYLOAD_FORMAT_INDICATOR, "01");
    return this;
  }

  setPointOfInitiation(isStatic: boolean): this {
    this.fields.set(
      EMV_TAGS.POINT_OF_INITIATION,
      isStatic ? POI_METHOD.STATIC : POI_METHOD.DYNAMIC,
    );
    return this;
  }

  addMerchantAccountInfo(
    tag: number,
    gui: string,
    additionalData: Array<{ tag: string; value: string }> = [],
  ): this {
    if (tag < 26 || tag > 51) {
      throw new Error("Merchant account info tag must be 26-51");
    }
    const templateFields = [{ tag: MAI_SUBTAGS.GLOBALLY_UNIQUE_ID, value: gui }, ...additionalData];
    const templateValue = EMVQRBuilder.buildTemplate(templateFields);
    this.fields.set(tag.toString().padStart(2, "0"), templateValue);
    return this;
  }

  setMCC(mcc: string): this {
    if (mcc?.length === 4) {
      this.fields.set(EMV_TAGS.MERCHANT_CATEGORY_CODE, mcc);
    }
    return this;
  }

  setTransactionCurrency(currencyCode: string): this {
    this.fields.set(EMV_TAGS.TRANSACTION_CURRENCY, currencyCode.padStart(3, "0"));
    return this;
  }

  setTransactionAmount(amount: number, currencyCode?: string): this {
    if (amount > 0) {
      const zeroDecimalCurrencies = new Set(["392", "410", "704", "348", "352", "901", "360"]);
      const formattedAmount = zeroDecimalCurrencies.has(currencyCode || "")
        ? Math.round(amount).toString()
        : amount.toFixed(2);
      this.fields.set(EMV_TAGS.TRANSACTION_AMOUNT, formattedAmount);
    }
    return this;
  }

  setTipIndicator(indicator: "01" | "02" | "03", value?: number): this {
    this.fields.set(EMV_TAGS.TIP_INDICATOR, indicator);
    if (indicator === "02" && value !== undefined) {
      this.fields.set(EMV_TAGS.TIP_FIXED, value.toFixed(2));
    } else if (indicator === "03" && value !== undefined) {
      this.fields.set(EMV_TAGS.TIP_PERCENTAGE, value.toString());
    }
    return this;
  }

  setCountryCode(countryCode: string): this {
    this.fields.set(EMV_TAGS.COUNTRY_CODE, countryCode.toUpperCase().substring(0, 2));
    return this;
  }

  setMerchantName(name: string): this {
    this.fields.set(EMV_TAGS.MERCHANT_NAME, name.substring(0, 25));
    return this;
  }

  setMerchantCity(city: string): this {
    this.fields.set(EMV_TAGS.MERCHANT_CITY, city.substring(0, 15));
    return this;
  }

  setPostalCode(postalCode: string): this {
    if (postalCode) {
      this.fields.set(EMV_TAGS.POSTAL_CODE, postalCode.substring(0, 10));
    }
    return this;
  }

  setAdditionalData(data: {
    billNumber?: string;
    mobileNumber?: string;
    storeLabel?: string;
    loyaltyNumber?: string;
    referenceLabel?: string;
    customerLabel?: string;
    terminalLabel?: string;
    purposeOfTransaction?: string;
    additionalConsumerData?: string;
  }): this {
    const templateFields: Array<{ tag: string; value: string }> = [];
    if (data.billNumber)
      templateFields.push({ tag: "01", value: data.billNumber.substring(0, 25) });
    if (data.mobileNumber)
      templateFields.push({ tag: "02", value: data.mobileNumber.substring(0, 25) });
    if (data.storeLabel)
      templateFields.push({ tag: "03", value: data.storeLabel.substring(0, 25) });
    if (data.loyaltyNumber)
      templateFields.push({ tag: "04", value: data.loyaltyNumber.substring(0, 25) });
    if (data.referenceLabel)
      templateFields.push({ tag: "05", value: data.referenceLabel.substring(0, 25) });
    if (data.customerLabel)
      templateFields.push({ tag: "06", value: data.customerLabel.substring(0, 25) });
    if (data.terminalLabel)
      templateFields.push({ tag: "07", value: data.terminalLabel.substring(0, 25) });
    if (data.purposeOfTransaction)
      templateFields.push({ tag: "08", value: data.purposeOfTransaction.substring(0, 25) });
    if (data.additionalConsumerData)
      templateFields.push({ tag: "09", value: data.additionalConsumerData.substring(0, 3) });

    if (templateFields.length > 0) {
      const templateValue = EMVQRBuilder.buildTemplate(templateFields);
      this.fields.set(EMV_TAGS.ADDITIONAL_DATA, templateValue);
    }
    return this;
  }

  setField(tag: string, value: string): this {
    if (value && value.length > 0) {
      this.fields.set(tag.padStart(2, "0"), value);
    }
    return this;
  }

  build(): string {
    const sortedTags = Array.from(this.fields.keys()).sort(
      (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
    );

    let payload = "";
    for (const tag of sortedTags) {
      const value = this.fields.get(tag);
      if (value) {
        payload += EMVQRBuilder.encodeTLV(tag, value);
      }
    }

    payload += "6304";
    const crc = crc16CCITT(payload);
    payload += crc;

    return payload;
  }

  static create(): EMVQRBuilder {
    return new EMVQRBuilder();
  }
}
