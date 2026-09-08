import { describe, it, expect } from "vitest";
import { calculatePaymobHmac, verifyPaymobWebhookSignature } from "@/lib/api/paymob";

describe("Paymob Webhook HMAC-SHA512 Cryptographic Signature", () => {
  const secretKey = "test_hmac_secret_key_123456789";

  const mockPayload = {
    amount_cents: 25000,
    created_at: "2026-09-08T12:00:00.000000",
    currency: "EGP",
    error_occured: false,
    has_parent_transaction: false,
    id: 99887766,
    integration_id: 123456,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 554433 },
    owner: 102030,
    pending: false,
    source_data: {
      pan: "2345",
      sub_type: "MasterCard",
      type: "card",
    },
    success: true,
  };

  it("calculates a deterministic SHA512 HMAC across the 20 lexicographical fields", () => {
    const hmac1 = calculatePaymobHmac(mockPayload, secretKey);
    const hmac2 = calculatePaymobHmac(mockPayload, secretKey);

    expect(hmac1).toBe(hmac2);
    expect(hmac1).toHaveLength(128); // 128 hex chars for SHA512
  });

  it("verifies a valid HMAC signature using constant-time equality", () => {
    const validHmac = calculatePaymobHmac(mockPayload, secretKey);
    const isValid = verifyPaymobWebhookSignature(mockPayload, validHmac, secretKey);

    expect(isValid).toBe(true);
  });

  it("rejects a forged or tampered webhook payload", () => {
    const validHmac = calculatePaymobHmac(mockPayload, secretKey);
    const tamperedPayload = {
      ...mockPayload,
      amount_cents: 10000, // Attacker attempts price tampering
    };

    const isValid = verifyPaymobWebhookSignature(tamperedPayload, validHmac, secretKey);
    expect(isValid).toBe(false);
  });

  it("rejects an invalid signature string", () => {
    const fakeHmac = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const isValid = verifyPaymobWebhookSignature(mockPayload, fakeHmac, secretKey);

    expect(isValid).toBe(false);
  });
});
