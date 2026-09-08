"use client";

import { useState } from "react";
import type { MockUnit } from "@/lib/db/mock-data";
import { CheckoutHeader } from "./checkout-header";
import { PaymentTabs, type PaymentMethodType } from "./payment-tabs";
import { VoucherRedemptionForm } from "./voucher-redemption-form";
import { ManualTransferForm } from "./manual-transfer-form";
import { PaymobCheckoutForm } from "./paymob-checkout-form";
import { CheckoutSuccessView } from "./checkout-success-view";

export interface EgyptianCheckoutModalProps {
  unit: MockUnit;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vodafoneCashNumber?: string;
  instapayAddress?: string;
}

export function EgyptianCheckoutModal({
  unit,
  isOpen,
  onClose,
  onSuccess,
  vodafoneCashNumber,
  instapayAddress,
}: EgyptianCheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethodType>("voucher_card");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountEgp: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    const PROMO_CODES: Record<string, { percent?: number; fixedEgp?: number }> = {
      WELCOME20: { percent: 20 },
      SUPER50: { fixedEgp: 50 },
      ELITE100: { fixedEgp: 100 },
      OCTOBER26: { percent: 25 },
    };

    const promo = PROMO_CODES[clean];
    if (!promo) {
      setCouponError("كود الخصم غير صحيح أو غير متاح حالياً.");
      return;
    }

    let discount = 0;
    if (promo.percent) {
      discount = Math.round((unit.priceEgp * promo.percent) / 100);
    } else if (promo.fixedEgp) {
      discount = promo.fixedEgp;
    }

    setAppliedCoupon({ code: clean, discountEgp: discount });
  };

  const effectivePrice = appliedCoupon ? Math.max(0, unit.priceEgp - appliedCoupon.discountEgp) : unit.priceEgp;
  const effectiveUnit = { ...unit, priceEgp: effectivePrice };

  const handleSuccessfulPayment = (message: string, delayMs = 2000) => {
    setSuccessMessage(message);
    setIsSubmitted(true);
    if (onSuccess) {
      setTimeout(() => onSuccess(), delayMs);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in-50 overflow-y-auto">
      <div className="modern-card w-full max-w-lg rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-5 border-2 border-purple-200 shadow-2xl bg-white relative my-auto max-h-[92dvh] overflow-y-auto">
        <CheckoutHeader
          unit={unit}
          onClose={onClose}
          effectivePrice={effectivePrice}
          discountAmount={appliedCoupon?.discountEgp}
        />

        {isSubmitted ? (
          <CheckoutSuccessView
            message={successMessage}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Promo Coupon Bar */}
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="كود الخصم (e.g. WELCOME20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-200 text-slate-900 placeholder-slate-400 font-mono font-bold uppercase text-xs focus:outline-none focus:border-purple-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors cursor-pointer"
                >
                  تطبيق الكوبون
                </button>
              </form>
              {appliedCoupon && (
                <p className="text-emerald-700 font-black text-xs flex items-center gap-1">
                  <span>✓</span>
                  <span>تم تطبيق كود ({appliedCoupon.code}) بنجاح! خصم {appliedCoupon.discountEgp} ج.م</span>
                </p>
              )}
              {couponError && (
                <p className="text-rose-600 font-bold text-xs">
                  {couponError}
                </p>
              )}
            </div>

            <PaymentTabs
              currentMethod={method}
              onSelectMethod={setMethod}
            />

            {method === "voucher_card" && (
              <VoucherRedemptionForm
                onSuccess={(msg) => handleSuccessfulPayment(msg, 2000)}
              />
            )}

            {method === "instapay_manual" && (
              <ManualTransferForm
                unit={effectiveUnit}
                vodafoneCashNumber={vodafoneCashNumber}
                instapayAddress={instapayAddress}
                couponCode={appliedCoupon?.code}
                onSuccess={(msg) => handleSuccessfulPayment(msg, 2200)}
              />
            )}

            {method === "paymob_wallet" && (
              <PaymobCheckoutForm
                unit={effectiveUnit}
                couponCode={appliedCoupon?.code}
                onSuccess={(msg) => handleSuccessfulPayment(msg, 2500)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
