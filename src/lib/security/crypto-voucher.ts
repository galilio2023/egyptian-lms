import crypto from "crypto";

// Unambiguous alphanumeric alphabet excluding confusing characters (0, O, 1, I, L, 8, B)
const SAFE_CHARSET = "2345679ACDEFGHJKMNPQRTUVWXYZ";

/**
 * Generates a cryptographically strong random token of specified length.
 */
export function generateCryptoToken(length = 4): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % SAFE_CHARSET.length;
    result += SAFE_CHARSET[randomIndex];
  }
  return result;
}

/**
 * Generates a formatted scratch card code.
 * Example: ELT-G1-9X7M-4K2P
 */
export function generateSecureVoucherCode(gradeNumber: number): string {
  const block1 = generateCryptoToken(4);
  const block2 = generateCryptoToken(4);
  return `ELT-G${gradeNumber}-${block1}-${block2}`;
}

export interface GeneratedVoucherItem {
  code: string;
  serialNumber: string;
  gradeTitle: string;
  priceEgp: number;
}

export interface BatchGenerationOptions {
  gradeNumber: number;
  quantity: number;
  priceEgp: number;
  batchTag?: string;
}

/**
 * Generates a batch of unique, cryptographically strong scratch card vouchers.
 */
export function generateSecureVoucherBatch(options: BatchGenerationOptions): GeneratedVoucherItem[] {
  const { gradeNumber, quantity, priceEgp } = options;
  const gradeNames: Record<number, string> = {
    1: "الصف الأول الابتدائي",
    2: "الصف الثاني الابتدائي",
    3: "الصف الثالث الابتدائي",
    4: "الصف الرابع الابتدائي",
    5: "الصف الخامس الابتدائي",
    6: "الصف السادس الابتدائي",
  };

  const gradeTitle = `${gradeNames[gradeNumber] || `الصف ${gradeNumber}`} الابتدائي`;
  const batchDatePrefix = new Date().toISOString().slice(2, 7).replace("-", ""); // e.g. "2609"
  const batchEntropy = crypto.randomBytes(2).toString("hex").toUpperCase(); // e.g. "A4F2"

  const codesSet = new Set<string>();
  const items: GeneratedVoucherItem[] = [];

  let index = 1;
  while (items.length < quantity) {
    const code = generateSecureVoucherCode(gradeNumber);
    if (!codesSet.has(code)) {
      codesSet.add(code);
      const serialNumber = `SN${gradeNumber}-${batchDatePrefix}${batchEntropy}-${String(index).padStart(3, "0")}`;
      items.push({
        code,
        serialNumber,
        gradeTitle,
        priceEgp,
      });
      index++;
    }
  }

  return items;
}
