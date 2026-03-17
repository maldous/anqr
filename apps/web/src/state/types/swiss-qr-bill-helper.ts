export interface SwissQRBillHelper {
  creditorIBAN: string;
  creditorName: string;
  creditorAddressType: "S" | "K";
  creditorStreet?: string;
  creditorBuildingNumber?: string;
  creditorPostalCode?: string;
  creditorCity?: string;
  creditorCountry: string;
  amount?: number;
  currency: "CHF" | "EUR";
  referenceType: "QRR" | "SCOR" | "NON";
  reference?: string;
  unstructuredMessage?: string;
  billInformation?: string;
}
