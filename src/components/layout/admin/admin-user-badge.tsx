import React from "react";
import { AdminShieldCrownSvg } from "@/components/ui/illustrated-icons";

export interface AdminUserBadgeProps {
  displayName: string;
  roleTitle: string;
}

export const AdminUserBadge: React.FC<AdminUserBadgeProps> = ({
  displayName,
  roleTitle,
}) => {
  return (
    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-vibrant text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-500/25">
        <AdminShieldCrownSvg className="w-5 h-5 text-white" />
      </div>
      <div className="overflow-hidden">
        <span className="text-xs font-black text-slate-900 block truncate leading-tight">
          {displayName}
        </span>
        <span className="text-[10px] text-purple-700 font-bold block truncate">
          {roleTitle}
        </span>
      </div>
    </div>
  );
};
