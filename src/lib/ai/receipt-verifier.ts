import crypto from "crypto";
import { scanEgyptianReceipt } from "@/lib/receipt-scanner";
import { getGeminiGenerateContentUrl } from "./constants";

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
  provider: "instapay" | "vodafone_cash" | "orange_cash" | "etisalat_cash" | "unknown";
  autoApprovalEligible: boolean;
  summaryArabic: string;
}

type DuplicateReceiptLookup = (hashOrReference: string) => Promise<string | undefined>;

const MAX_RECEIPT_BYTES = 15 * 1024 * 1024;
const VALID_PROVIDERS = new Set<IntelligentReceiptVerificationResult["provider"]>([
  "instapay",
  "vodafone_cash",
  "orange_cash",
  "etisalat_cash",
  "unknown",
]);

export function normalizeReceiptReference(reference: unknown): string | undefined {
  if (typeof reference !== "string") return undefined;
  const normalized = reference.trim().replace(/\s+/g, "").toUpperCase();
  return normalized || undefined;
}

/** Computes a SHA-256 hash from receipt content for exact duplicate detection. */
export function computeReceiptSha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function parseReceiptImageDataUrl(receipt: string) {
  if (!receipt.toLowerCase().startsWith("data:image/")) return undefined;

  const match = receipt.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i
  );
  if (!match) {
    throw new Error("Receipt image data URL is malformed or unsupported");
  }

  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (bytes.length === 0 || bytes.length > MAX_RECEIPT_BYTES) {
    throw new Error("Receipt image is empty or too large");
  }

  return {
    inlineData: {
      mimeType: match[1].toLowerCase(),
      data: bytes.toString("base64"),
    },
  };
}

/**
 * Verifies an Egyptian payment receipt. Only successful Gemini media analysis can
 * make a receipt eligible for automatic approval; all fallback scans require review.
 */
export async function verifyEgyptianPaymentReceipt(options: {
  receiptImageOrText: string;
  expectedAmountEgp: number;
  existingReceiptHashes?: Record<string, string>;
  findExistingReceipt?: DuplicateReceiptLookup;
}): Promise<IntelligentReceiptVerificationResult> {
  const {
    receiptImageOrText,
    expectedAmountEgp,
    existingReceiptHashes = {},
    findExistingReceipt,
  } = options;
  const receiptHash = computeReceiptSha256(receiptImageOrText);

  const findDuplicate = async (identifier: string) => {
    const normalized = /^[a-f0-9]{64}$/.test(identifier)
      ? identifier
      : normalizeReceiptReference(identifier) || identifier;
    return (
      existingReceiptHashes[identifier] ||
      existingReceiptHashes[normalized] ||
      (findExistingReceipt ? await findExistingReceipt(normalized) : undefined)
    );
  };

  const duplicateByHash = await findDuplicate(receiptHash);
  if (duplicateByHash) {
    return {
      isVerified: false,
      confidenceScore: 0,
      receiptHash,
      isDuplicate: true,
      duplicateOrderId: duplicateByHash,
      provider: "unknown",
      autoApprovalEligible: false,
      summaryArabic: `⚠️ تحذير: تم استخدام نفس صورة هذا الإيصال مسبقاً في الطلب (${duplicateByHash})!`,
    };
  }

  let imagePart: ReturnType<typeof parseReceiptImageDataUrl>;
  try {
    imagePart = parseReceiptImageDataUrl(receiptImageOrText);
  } catch (error) {
    console.warn("Receipt image could not be prepared for Gemini:", error);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey.trim().length > 10 && (!/^data:image\//i.test(receiptImageOrText) || imagePart)) {
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

      const receiptPart = imagePart
        ? imagePart
        : { text: `Receipt reference text: ${receiptImageOrText.slice(0, 2000)}` };
      const response = await fetch(
        getGeminiGenerateContentUrl(geminiApiKey),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, receiptPart] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof rawText !== "string" || !rawText.trim()) {
          throw new Error("Gemini returned no receipt analysis");
        }

        const parsed = JSON.parse(rawText) as Record<string, unknown>;
        if (
          typeof parsed.confidenceScore !== "number" ||
          !Number.isFinite(parsed.confidenceScore) ||
          parsed.confidenceScore < 0 ||
          parsed.confidenceScore > 100 ||
          typeof parsed.amountEgp !== "number" ||
          !Number.isFinite(parsed.amountEgp) ||
          typeof parsed.isLegitReceipt !== "boolean"
        ) {
          throw new Error("Gemini returned malformed receipt analysis");
        }

        const confidence = parsed.confidenceScore;
        const provider = VALID_PROVIDERS.has(parsed.provider as IntelligentReceiptVerificationResult["provider"])
          ? (parsed.provider as IntelligentReceiptVerificationResult["provider"])
          : "unknown";
        const extractedReference = normalizeReceiptReference(parsed.referenceNumber);
        const duplicateOrderId = extractedReference
          ? await findDuplicate(extractedReference)
          : undefined;
        const amountMatches = parsed.amountEgp === expectedAmountEgp;
        const mediaAnalysisSucceeded = Boolean(imagePart);
        const eligible =
          mediaAnalysisSucceeded &&
          parsed.isLegitReceipt &&
          amountMatches &&
          confidence >= 90 &&
          !duplicateOrderId;

        return {
          isVerified: mediaAnalysisSucceeded && parsed.isLegitReceipt,
          confidenceScore: confidence,
          extractedReference,
          extractedAmount: parsed.amountEgp,
          extractedDate:
            typeof parsed.transferDate === "string" && parsed.transferDate
              ? parsed.transferDate
              : undefined,
          matchedSender: typeof parsed.sender === "string" ? parsed.sender : undefined,
          receiptHash,
          isDuplicate: Boolean(duplicateOrderId),
          duplicateOrderId,
          provider,
          autoApprovalEligible: eligible,
          summaryArabic: duplicateOrderId
            ? `⚠️ تحذير: تم استخدام نفس رقم العملية سابقاً في الطلب (${duplicateOrderId})!`
            : eligible
              ? `تم التحقق من إيصال ${provider} بنجاح ومطابقة المبلغ (${parsed.amountEgp} ج.م) بالذكاء الاصطناعي.`
              : `تم فحص الإيصال ويتطلب مراجعة السكرتارية (درجة الثقة: ${confidence}%).`,
        };
      }
    } catch (error) {
      console.warn("Live Gemini Receipt OCR note:", error);
    }
  }

  const fallback = scanEgyptianReceipt(receiptImageOrText, expectedAmountEgp, existingReceiptHashes);
  const fallbackReference = normalizeReceiptReference(fallback.extractedReference);
  const duplicateOrderId = fallbackReference
    ? await findDuplicate(fallbackReference)
    : fallback.duplicateOrderId;

  return {
    isVerified: false,
    confidenceScore: fallback.confidenceScore,
    extractedReference: fallbackReference,
    extractedAmount: fallback.extractedAmount,
    extractedDate: fallback.extractedDate,
    matchedSender: fallback.matchedSender,
    receiptHash,
    isDuplicate: Boolean(duplicateOrderId || fallback.isSuspectedDuplicate),
    duplicateOrderId,
    provider: fallback.provider,
    autoApprovalEligible: false,
    summaryArabic: duplicateOrderId
      ? `⚠️ تحذير: تم استخدام نفس رقم العملية سابقاً في الطلب (${duplicateOrderId})!`
      : "تم استلام الإيصال وجاري إرساله للمراجعة السريعة بواسطة السكرتارية.",
  };
}
