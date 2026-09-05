import React from "react";
import { Sparkles } from "lucide-react";
import { 
  XpGemSvg, 
  StreakFlameSvg, 
  ToyDinoDinoSvg, 
  ToyPrincessUnicornSvg 
} from "@/components/ui/illustrated-icons";
import { StudentDashboardProfile, MascotItem } from "../types";

export interface StudentHeroCardProps {
  student: StudentDashboardProfile;
  activeMascot: MascotItem;
}

export const StudentHeroCard: React.FC<StudentHeroCardProps> = ({
  student,
  activeMascot,
}) => {
  const ActiveMascotSvg = activeMascot.SvgComponent;
  const xpPercentage = Math.min(100, Math.round((student.xpPoints / student.nextLevelXp) * 100));

  return (
    <div className="modern-card p-6 sm:p-8 bg-gradient-vibrant text-white border-0 shadow-xl shadow-purple-600/25 relative overflow-hidden">
      {/* Glowing Aura Rings */}
      <div className="absolute -bottom-10 -end-10 w-72 h-72 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 start-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Cheerful Toys inside Student Hero */}
      <div className="absolute top-3 end-4 sm:end-12 animate-float-slow pointer-events-none opacity-85 hover:opacity-100 transition-opacity">
        <ToyDinoDinoSvg className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-lg" />
      </div>
      <div className="absolute bottom-2 start-4 sm:start-24 animate-float-reverse pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
        <ToyPrincessUnicornSvg className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
            <ActiveMascotSvg className="w-5 h-5" />
            <span>المستوى {student.levelNumber}: {activeMascot.title}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            أهلاً بك يا بطل اللغة الإنجليزية {student.name} 👋
          </h1>
          
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl font-medium leading-relaxed">
            واصل مغامراتك التعليمية الشيقة، احصل على النقاط واجتز الاختبارات لترقية بطلك!
          </p>

          {/* XP Level Progress Bar */}
          <div className="space-y-1.5 max-w-md pt-1">
            <div className="flex items-center justify-between text-xs font-black text-white">
              <span>المستوى {student.levelNumber}</span>
              <span className="text-amber-200 font-bold">
                {student.xpPoints} / {student.nextLevelXp} XP (باقي {student.nextLevelXp - student.xpPoints} للمستوى التالي)
              </span>
            </div>
            <div className="w-full h-3 bg-purple-950/40 rounded-full overflow-hidden p-0.5 border border-white/30 backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-4 text-center min-w-[110px] shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 mb-1">
              <XpGemSvg className="w-5 h-5 drop-shadow" />
              <span className="text-xs font-black">نقاط XP</span>
            </div>
            <div className="text-2xl font-black text-white">{student.xpPoints}</div>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-4 text-center min-w-[110px] shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-orange-300 mb-1">
              <StreakFlameSvg className="w-5 h-5 drop-shadow" />
              <span className="text-xs font-black">حماس متتالي</span>
            </div>
            <div className="text-2xl font-black text-white">{student.streakDays} أيام</div>
          </div>
        </div>
      </div>
    </div>
  );
};
