"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutSuccessViewProps {
  message: string;
  onClose: () => void;
}

export function CheckoutSuccessView({ message, onClose }: CheckoutSuccessViewProps) {
  return (
    <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-9 h-9" />
      </div>
      <h4 className="text-xl font-black text-slate-900">تم تفعيل الاشتراك بنجاح!</h4>
      <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
        {message}
      </p>
      <Button
        variant="vibrant"
        size="lg"
        onClick={onClose}
        className="w-full shadow-lg shadow-purple-500/25"
      >
        الذهاب إلى كورس الطالب 🚀
      </Button>
    </div>
  );
}
