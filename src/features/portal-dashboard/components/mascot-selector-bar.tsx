import React from "react";
import { toast } from "sonner";
import { ChampionCupSvg } from "@/components/ui/illustrated-icons";
import { MascotItem } from "../types";

export interface MascotSelectorBarProps {
  mascots: MascotItem[];
  selectedMascot: MascotItem;
  onSelectMascot: (mascot: MascotItem) => void;
}

export const MascotSelectorBar: React.FC<MascotSelectorBarProps> = ({
  mascots,
  selectedMascot,
  onSelectMascot,
}) => {
  return (
    <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
          <ChampionCupSvg className="w-5 h-5" />
          <span>اختر تميمتك وشخصيتك البطلة:</span>
        </h3>
        <span className="text-[11px] text-purple-700 font-extrabold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          شخصية نشطة: {selectedMascot.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {mascots.map((m) => {
          const isSelected = selectedMascot.id === m.id;
          const IconSvg = m.SvgComponent;
          return (
            <button
              key={m.id}
              onClick={() => {
                onSelectMascot(m);
                toast.success(`تم اختيار ${m.name} كتميمة الطالب!`);
              }}
              className={`p-3.5 rounded-2xl border-2 text-right transition-all flex items-center gap-3 cursor-pointer ${
                isSelected
                  ? "bg-purple-50/80 border-purple-500 shadow-md ring-4 ring-purple-100 scale-[1.02]"
                  : "bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/40"
              }`}
            >
              <IconSvg className="w-9 h-9 shrink-0 drop-shadow-sm" />
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 block truncate">{m.name}</span>
                <span className="text-[10px] text-purple-600 font-bold block truncate">{m.title}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
