import type { MockOrder } from "@/lib/db/mock-data";

export type { MockOrder };

export interface GeneratedVoucher {
  code: string;
  serialNumber: string;
  gradeTitle: string;
  priceEgp: number;
}
