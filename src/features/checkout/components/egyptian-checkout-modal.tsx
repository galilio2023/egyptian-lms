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

  if (!isOpen) return null;

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
        <CheckoutHeader unit={unit} onClose={onClose} />

        {isSubmitted ? (
          <CheckoutSuccessView
            message={successMessage}
            onClose={onClose}
          />
        ) : (
          <>
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
                unit={unit}
                vodafoneCashNumber={vodafoneCashNumber}
                instapayAddress={instapayAddress}
                onSuccess={(msg) => handleSuccessfulPayment(msg, 2200)}
              />
            )}

            {method === "paymob_wallet" && (
              <PaymobCheckoutForm
                unit={unit}
                onSuccess={(msg) => handleSuccessfulPayment(msg, 2500)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
