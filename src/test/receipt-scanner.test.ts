import { describe, it, expect } from "vitest";
import { scanEgyptianReceipt, generateReceiptHash } from "@/lib/receipt-scanner";

describe("Egyptian Payment Receipt Scanner & Anti-Fraud", () => {
  it("generates deterministic receipt hash for screenshot fingerprinting", () => {
    const hash1 = generateReceiptHash("https://cdn.example.com/receipt-123.jpg");
    const hash2 = generateReceiptHash("https://cdn.example.com/receipt-123.jpg");
    const hash3 = generateReceiptHash("https://cdn.example.com/receipt-456.jpg");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toMatch(/^rcpt_hash_/);
  });

  it("identifies InstaPay receipts and extracts reference numbers", () => {
    const sampleText = "تم التحويل بنجاح عبر إنستاباي InstaPay رقم العملية المرجعي 202611099238 بمبلغ 250 ج.م";
    const result = scanEgyptianReceipt(sampleText, 250);

    expect(result.provider).toBe("instapay");
    expect(result.extractedReference).toBe("202611099238");
    expect(result.extractedAmount).toBe(250);
    expect(result.amountMatchesUnit).toBe(true);
    expect(result.isSuspectedDuplicate).toBe(false);
  });

  it("identifies Vodafone Cash receipts and sender numbers", () => {
    const sampleText = "تم تحويل 300 جنيه إلى محفظة فودافون كاش من الرقم 01012345678 كود المعاملة VF889123";
    const result = scanEgyptianReceipt(sampleText, 300);

    expect(result.provider).toBe("vodafone_cash");
    expect(result.matchedSender).toBe("01012345678");
    expect(result.extractedAmount).toBe(300);
    expect(result.amountMatchesUnit).toBe(true);
  });

  it("flags duplicate receipts when reference number has already been used", () => {
    const existingHashes: Record<string, string> = {
      "202611099238": "order_existing_123",
    };
    const sampleText = "إنستاباي رقم العملية: 202611099238 بمبلغ 250 ج.م";
    const result = scanEgyptianReceipt(sampleText, 250, existingHashes);

    expect(result.isSuspectedDuplicate).toBe(true);
    expect(result.duplicateOrderId).toBe("order_existing_123");
    expect(result.warnings.some((w) => w.includes("تحذير احتيال"))).toBe(true);
  });

  it("flags amount mismatch warning when transferred amount does not match unit price", () => {
    const sampleText = "تم تحويل 150 ج.م عبر إنستاباي رقم المعاملة 77665544";
    const result = scanEgyptianReceipt(sampleText, 250); // Expected 250, got 150

    expect(result.amountMatchesUnit).toBe(false);
    expect(result.warnings.some((w) => w.includes("لا يطابق سعر الوحدة"))).toBe(true);
  });
});
