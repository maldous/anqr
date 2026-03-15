export interface EPCSepaParams {
  name: string;
  iban: string;
  bic?: string;
  amount?: number;
  reference?: string;
  text?: string;
}
