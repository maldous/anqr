import { generateSwissQRBill } from "@/domain/payload/generators";
import type { PayloadData } from "./payload-data";

export function serializeSwissQRBill(payload: PayloadData): string {
  const sqb = payload.swissQRBill;
  if (!(sqb.creditorIBAN && sqb.creditorName)) return "";
  return generateSwissQRBill({
    creditorIBAN: sqb.creditorIBAN,
    creditorName: sqb.creditorName,
    creditorAddressType: sqb.creditorAddressType,
    creditorStreet: sqb.creditorStreet,
    creditorBuildingNumber: sqb.creditorBuildingNumber,
    creditorPostalCode: sqb.creditorPostalCode,
    creditorCity: sqb.creditorCity,
    creditorCountry: sqb.creditorCountry,
    amount: sqb.amount,
    currency: sqb.currency,
    referenceType: sqb.referenceType,
    reference: sqb.reference,
    unstructuredMessage: sqb.unstructuredMessage,
    billInformation: sqb.billInformation,
  });
}
