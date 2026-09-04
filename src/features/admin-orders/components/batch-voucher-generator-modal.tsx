"use client";

import React from "react";
import { X } from "lucide-react";
import { CenterVoucherCardSvg } from "@/components/ui/illustrated-icons";
import { useBatchVouchers } from "../hooks/use-batch-vouchers";
import { VoucherControlsForm } from "./voucher-controls-form";
import { VoucherPrintGrid } from "./voucher-print-grid";

export interface BatchVoucherGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchVoucherGeneratorModal({
  isOpen,
  onClose,
}: BatchVoucherGeneratorModalProps) {
  const {
    grade,
    setGrade,
    quantity,
    setQuantity,
    price,
    setPrice,
    generatedVouchers,
    isSaving,
    generateVouchers,
    copyAllCodes,
    handlePrint,
  } = useBatchVouchers();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border-2 border-purple-200 print:border-0 print:shadow-none print:max-w-none print:w-full">
        {/* Header - hidden in print */}
        <div className="print:hidden p-5 bg-gradient-vibrant text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CenterVoucherCardSvg className="w-8 h-8" />
            <div>
              <h2 className="text-base font-black">مولد كروت السنتر المطبوعة (Batch Vouchers)</h2>
              <span className="text-xs text-purple-100 font-medium">
                توليد وطباعة كروت الشحن للأكاديمية والسناتر الخارجية
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Generator Controls */}
        <VoucherControlsForm
          grade={grade}
          onGradeChange={setGrade}
          quantity={quantity}
          onQuantityChange={setQuantity}
          price={price}
          onPriceChange={setPrice}
          isSaving={isSaving}
          hasVouchers={generatedVouchers.length > 0}
          onGenerate={generateVouchers}
          onCopyAll={copyAllCodes}
          onPrint={handlePrint}
        />

        {/* Printable Scratch Cards Sheet Canvas */}
        <VoucherPrintGrid vouchers={generatedVouchers} />
      </div>
    </div>
  );
}
