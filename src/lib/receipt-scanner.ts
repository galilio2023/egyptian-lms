/**
 * Smart OCR & Anti-Fraud Scanner for Egyptian Financial Receipts
 * Specifically tuned for InstaPay and Egyptian Mobile Wallets (Vodafone Cash, Orange, Etisalat, WE)
 */

export interface ScannedReceiptResult {
  extractedReference?: string;
  extractedAmount?: number;
  extractedDate?: string;
  matchedSender?: string;
  confidenceScore: number;
  provider: 'instapay' | 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'unknown';
  isSuspectedDuplicate: boolean;
  duplicateOrderId?: string;
  amountMatchesUnit: boolean;
  warnings: string[];
}

/**
 * Generate a deterministic receipt fingerprint hash based on the image URL or string content
 */
export function generateReceiptHash(imageContentOrUrl: string): string {
  let hash = 0;
  for (let i = 0; i < imageContentOrUrl.length; i++) {
    const char = imageContentOrUrl.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `rcpt_hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Heuristic OCR parser for Egyptian financial screenshots
 */
export function scanEgyptianReceipt(
  rawTextOrRef: string,
  expectedAmountEgp: number,
  existingReceiptHashes: Record<string, string> = {}
): ScannedReceiptResult {
  const warnings: string[] = [];
  let confidenceScore = 80;
  let provider: ScannedReceiptResult['provider'] = 'unknown';

  // 1. Detect Provider
  if (/instapay|إنستاباي|انستاباي|ipn/i.test(rawTextOrRef)) {
    provider = 'instapay';
    confidenceScore += 10;
  } else if (/vodafone|فودافون|vf/i.test(rawTextOrRef)) {
    provider = 'vodafone_cash';
    confidenceScore += 10;
  } else if (/orange|أورانج|اورنج/i.test(rawTextOrRef)) {
    provider = 'orange_cash';
  } else if (/etisalat|اتصالات/i.test(rawTextOrRef)) {
    provider = 'etisalat_cash';
  }

  // 2. Extract Reference Number Pattern
  // InstaPay: typically 8-12 digits
  // Vodafone Cash: 6-10 alphanumeric or digits
  const refMatch = rawTextOrRef.match(/(?:ref|رقم العملية|المرجعي|كود العملية|رقم المعاملة|ref\s*no)[\s:#-]*([A-Z0-9]{6,14})/i) ||
                   rawTextOrRef.match(/\b(202[4-6]\d{6,10})\b/) ||
                   rawTextOrRef.match(/\b([0-9]{7,12})\b/);

  const extractedReference = refMatch ? refMatch[1] : undefined;

  // 3. Extract Amount (EGP / ج.م / جنيه)
  const amountMatch = rawTextOrRef.match(/(\d+(?:\.\d{1,2})?)\s*(?:egp|ج\.م|جنيه|pounds?)/i) ||
                      rawTextOrRef.match(/(?:مبلغ|قيمة|amount)[\s:#]*(\d+(?:\.\d{1,2})?)/i) ||
                      rawTextOrRef.match(/\b(250|300|350|400|500|200|150)\b/);

  const extractedAmount = amountMatch ? parseFloat(amountMatch[1]) : expectedAmountEgp;

  // 4. Extract Sender Mobile or IPN Handle
  const senderMatch = rawTextOrRef.match(/(01[0125]\d{8})/) ||
                      rawTextOrRef.match(/([a-zA-Z0-9._]+@instapay)/i);
  const matchedSender = senderMatch ? senderMatch[1] : undefined;

  // 5. Anti-Fraud Duplicate Check
  let isSuspectedDuplicate = false;
  let duplicateOrderId: string | undefined;

  if (extractedReference && existingReceiptHashes[extractedReference]) {
    isSuspectedDuplicate = true;
    duplicateOrderId = existingReceiptHashes[extractedReference];
    warnings.push(`⚠️ تحذير احتيال: تم استخدام نفس رقم العملية سابقاً في الطلب (${duplicateOrderId})!`);
  }

  // 6. Check Amount Match
  const amountMatchesUnit = extractedAmount === expectedAmountEgp;
  if (!amountMatchesUnit) {
    warnings.push(`⚠️ تنبيه: المبلغ الموجود في الإيصال (${extractedAmount} ج.م) لا يطابق سعر الوحدة المطلوبة (${expectedAmountEgp} ج.م).`);
    confidenceScore -= 20;
  }

  return {
    extractedReference,
    extractedAmount,
    extractedDate: new Date().toLocaleDateString('ar-EG'),
    matchedSender,
    confidenceScore: Math.min(99, Math.max(50, confidenceScore)),
    provider,
    isSuspectedDuplicate,
    duplicateOrderId,
    amountMatchesUnit,
    warnings,
  };
}
