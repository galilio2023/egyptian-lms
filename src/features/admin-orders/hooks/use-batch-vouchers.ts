"use client";

import { useState } from "react";
import { toast } from "sonner";
import { executeAdminAction } from "@/lib/api/admin-client";
import type { GeneratedVoucher } from "../types";

export function useBatchVouchers() {
  const [grade, setGrade] = useState("1");
  const [quantity, setQuantity] = useState(10);
  const [price, setPrice] = useState(150);
  const [generatedVouchers, setGeneratedVouchers] = useState<GeneratedVoucher[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const generateVouchers = async () => {
    setIsSaving(true);
    try {
      const result = await executeAdminAction<{ vouchers?: GeneratedVoucher[] }>(
        "generate_secure_vouchers",
        {
          gradeNumber: parseInt(grade, 10),
          quantity,
          priceEgp: price,
          batchName: `دفعة سناتر الصف ${grade} - مشفرة عالي الأمان (${new Date().toLocaleDateString("ar-EG")})`,
        },
        { showToast: false }
      );

      if (result.success && result.data?.vouchers && result.data.vouchers.length > 0) {
        setGeneratedVouchers(result.data.vouchers);
        toast.success(`🎉 تم توليد وحفظ ${result.data.vouchers.length} كارت شحن عالي التشفير بنجاح!`);
      } else {
        toast.error(result.error || "تعذر توليد كروت الشحن، يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const copyAllCodes = () => {
    const text = generatedVouchers.map((v) => `${v.serialNumber}: ${v.code}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ جميع الأكواد إلى الحافظة!");
  };

  const handlePrint = () => {
    window.print();
  };

  return {
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
  };
}
