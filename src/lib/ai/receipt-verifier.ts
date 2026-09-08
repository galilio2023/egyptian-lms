import crypto from "crypto";
import { scanEgyptianReceipt, type ScannedReceiptResult } from "@/lib/receipt-scanner";

export interface IntelligentReceiptVerificationResult {
  isVerified: boolean;
  confidenceScore: number;
  extractedReference?: string;
  extractedAmount?: number;
  extractedDate?: string;
  matchedSender?: string;
  receiptHash: string;
  isDuplicate: boolean;
  duplicateOrderId?: string;
  provider: 'instapay' | 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'unknown';
  autoApprovalEligible: boolean;
  summaryArabic: string;
}

/**
 * Computes a robust SHA-256 hash from image content or URL to detect duplicate receipt screenshots.
 */
export function computeReceiptSha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Intelligent Egyptian Receipt Verifier using AI Vision with graceful deterministic heuristic fallback.
 */
export async function verifyEgyptianPaymentReceipt(options: {
  receiptImageOrText: string;
  expectedAmountEgp: number;
  existingReceiptHashes?: Record<string, string>;
}): Promise<IntelligentReceiptVerificationResult> {
  const { receiptImageOrText, expectedAmountEgp, existingReceiptHashes = {} } = options;
  const receiptHash = computeReceiptSha256(receiptImageOrText);

  // 1. Check duplicate receipt hash
  if (existingReceiptHashes[receiptHash]) {
    const existingOrderId = existingReceiptHashes[receiptHash];
    return {
      isVerified: false,
      confidenceScore: 98,
      receiptHash,
      isDuplicate: true,
      duplicateOrderId: existingOrderId,
      provider: 'unknown',
      autoApprovalEligible: false,
      summaryArabic: `⚠️ تحذير: تم استخدام نفس صورة هذا الإيصال مسبقاً في الطلب (${existingOrderId})!`,
    };
  }

  // 2. Check if live Gemini API is configured
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const prompt = `You are an automated financial auditor for Egyptian EdTech payments.
Analyze this InstaPay or Egyptian Telecom Mobile Wallet (Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay) transfer receipt.
Expected amount: ${expectedAmountEgp} EGP.

Extract and return JSON only:
{
  "provider": "instapay" | "vodafone_cash" | "orange_cash" | "etisalat_cash" | "unknown",
  "referenceNumber": string,
  "amountEgp": number,
  "sender": string,
  "transferDate": string,
  "confidenceScore": number (0 to 100),
  "isLegitReceipt": boolean
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { text: `Receipt image or reference text: ${receiptImageOrText.slice(0, 2000)}` },
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const amountMatches = parsed.amountEgp === expectedAmountEgp;
          const confidence = parsed.confidenceScore || 90;
          const eligible = parsed.isLegitReceipt && amountMatches && confidence >= 90;

          return {
            isVerified: Boolean(parsed.isLegitReceipt),
            confidenceScore: confidence,
            extractedReference: parsed.referenceNumber,
            extractedAmount: parsed.amountEgp,
            extractedDate: parsed.transferDate || new Date().toLocaleDateString("ar-EG"),
            matchedSender: parsed.sender,
            receiptHash,
            isDuplicate: false,
            provider: parsed.provider || "instapay",
            autoApprovalEligible: eligible,
            summaryArabic: eligible
              ? `تم التحقق من إيصال ${parsed.provider || "التحويل"} بنجاح ومطابقة المبلغ (${parsed.amountEgp} ج.م) بالذكاء الاصطناعي.`
              : `تم فحص الإيصال بالذكاء الاصطناعي ويتطلب مراجعة السكرتارية (درجة الثقة: ${confidence}%).`,
          };
        }
      }
    } catch (err) {
      console.warn("Live Gemini Receipt OCR note:", err);
    }
  }

  // 3. Deterministic Heuristic Scanner Fallback
  const fallback = scanEgyptianReceipt(receiptImageOrText, expectedAmountEgp, existingReceiptHashes);
  const eligible = fallback.confidenceScore >= 85 && fallback.amountMatchesUnit && !fallback.isSuspectedDuplicate;

  return {
    isVerified: !fallback.isSuspectedDuplicate,
    confidenceScore: fallback.confidenceScore,
    extractedReference: fallback.extractedReference,
    extractedAmount: fallback.extractedAmount,
    extractedDate: fallback.extractedDate,
    matchedSender: fallback.matchedSender,
    receiptHash,
    isDuplicate: fallback.isSuspectedDuplicate,
    duplicateOrderId: fallback.duplicateOrderId,
    provider: fallback.provider,
    autoApprovalEligible: eligible,
    summaryArabic: eligible
      ? `تم فحص الإيصال آلياً والتأكد من مطابقة المبلغ (${fallback.extractedAmount} ج.م) وصحة البيانات.`
      : `تم استلام الإيصال وجاري إرساله للمراجعة السريعة بواسطة السكرتارية.`,
  };
}
