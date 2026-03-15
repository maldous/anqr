export interface UPIParams {
  pa: string;
  pn?: string;
  am?: number;
  cu?: string;
  tn?: string;
  tr?: string;
  mc?: string;
  tid?: string;
  url?: string;
  mode?: '00' | '01' | '02' | '03' | '04' | '05' | '06';
  purpose?: string;
  orgid?: string;
  sign?: string;
}
