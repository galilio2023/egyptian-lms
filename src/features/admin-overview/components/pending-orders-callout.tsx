"use client";

import Link from "next/link";
import { EgyptianWalletSvg } from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";

interface PendingOrdersCalloutProps {
  pendingCount: number;
}

export function PendingOrdersCallout({ pendingCount }: PendingOrdersCalloutProps) {
  if (pendingCount <= 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-3">
        <EgyptianWalletSvg className="w-10 h-10 shrink-0" />
        <div className="space-y-0.5">
          <span className="text-sm font-black text-amber-950 block">
            تنبيه: يوجد {pendingCount} طلبات اشتراك تحتاج موافقة وتفعيل فوري
          </span>
          <p className="text-xs text-amber-800 font-medium">
            قام أولياء الأمور بتحويل المبلغ عبر إنستاباي / فودافون كاش وإرفاق الإيصالات. اضغط لمراجعتها والتفعيل بضغطة زر.
          </p>
        </div>
      </div>

      <Link
        href="/admin/orders"
        className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/25 shrink-0 transition-all"
      >
        الانتقال لصفحة الإيصالات
      </Link>
    </Card>
  );
}
