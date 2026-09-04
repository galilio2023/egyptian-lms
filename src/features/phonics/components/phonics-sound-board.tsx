"use client";

import { useState, useCallback } from "react";
import { Volume2, Sparkles } from "lucide-react";
import { PhonicsSpeechSvg } from "@/components/ui/illustrated-icons";

interface PhonicsItem {
  id: string;
  sound: string;
  label: string;
  exampleWord: string;
  translation: string;
  emoji: string;
  category: "vowels" | "digraphs" | "alphabet";
}

const PHONICS_DATA: PhonicsItem[] = [
  { id: "a", sound: "A", label: "أَ (Short A)", exampleWord: "Apple", translation: "تفاحة", emoji: "🍎", category: "vowels" },
  { id: "b", sound: "B", label: "بـ", exampleWord: "Ball", translation: "كرة", emoji: "⚽", category: "alphabet" },
  { id: "c", sound: "C", label: "كـ / سـ", exampleWord: "Cat", translation: "قطة", emoji: "🐱", category: "alphabet" },
  { id: "d", sound: "D", label: "د", exampleWord: "Dino", translation: "ديناصور", emoji: "🦕", category: "alphabet" },
  { id: "e", sound: "E", label: "إِ (Short E)", exampleWord: "Egg", translation: "بيضة", emoji: "🥚", category: "vowels" },
  { id: "f", sound: "F", label: "فـ", exampleWord: "Fish", translation: "سمكة", emoji: "🐟", category: "alphabet" },
  { id: "sh", sound: "Sh", label: "شـ (S+H)", exampleWord: "Ship", translation: "سفينة", emoji: "🚢", category: "digraphs" },
  { id: "ch", sound: "Ch", label: "تـش (C+H)", exampleWord: "Chair", translation: "كرسي", emoji: "🪑", category: "digraphs" },
  { id: "th-soft", sound: "Th", label: "ثـ (Soft Th)", exampleWord: "Three", translation: "رقم 3", emoji: "3️⃣", category: "digraphs" },
  { id: "th-hard", sound: "Th", label: "ذ (Hard Th)", exampleWord: "Mother", translation: "أم", emoji: "👩", category: "digraphs" },
  { id: "ph", sound: "Ph", label: "فـ (P+H)", exampleWord: "Phone", translation: "هاتف", emoji: "📱", category: "digraphs" },
  { id: "oo", sound: "Oo", label: "وو (Long OO)", exampleWord: "Moon", translation: "قمر", emoji: "🌙", category: "digraphs" },
  { id: "ee", sound: "Ee", label: "يـي (Long EE)", exampleWord: "Bee", translation: "نحلة", emoji: "🐝", category: "digraphs" },
];

export function PhonicsSoundBoard() {
  const [activeTab, setActiveTab] = useState<"all" | "digraphs" | "vowels">("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const speakText = useCallback((word: string, soundId: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1.15;

    utterance.onstart = () => {
      setPlayingId(soundId);
    };

    utterance.onend = () => {
      setPlayingId(null);
    };

    utterance.onerror = () => {
      setPlayingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const filteredItems = activeTab === "all" 
    ? PHONICS_DATA 
    : PHONICS_DATA.filter((i) => i.category === activeTab || (activeTab === "vowels" && i.category === "alphabet"));

  return (
    <div className="modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-vibrant text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
            <PhonicsSpeechSvg className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                لوحة نطق الصوتيات التفاعلية <span className="text-gradient-purple">(Phonics Sound Board)</span>
              </h3>
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            </div>
            <p className="text-xs text-purple-700 font-bold mt-0.5">
              اضغط على أي حرف أو كلمة لتستمع إلى النطق الإنجليزي الصحيح مع الترديد 🗣️✨
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-purple-50 border border-purple-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === "all" ? "bg-purple-600 text-white shadow-sm" : "text-purple-800 hover:bg-purple-100"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab("digraphs")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === "digraphs" ? "bg-purple-600 text-white shadow-sm" : "text-purple-800 hover:bg-purple-100"
            }`}
          >
            الحروف المركبة (Sh, Ch...)
          </button>
          <button
            onClick={() => setActiveTab("vowels")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === "vowels" ? "bg-purple-600 text-white shadow-sm" : "text-purple-800 hover:bg-purple-100"
            }`}
          >
            الحروف المتحركة (Vowels)
          </button>
        </div>
      </div>

      {/* Grid of Sound Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {filteredItems.map((item) => {
          const isCurrent = playingId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => speakText(`${item.sound}... ${item.exampleWord}`, item.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all duration-300 text-right flex flex-col justify-between gap-3 relative overflow-hidden group hover:scale-[1.03] hover:-translate-y-1 cursor-pointer ${
                isCurrent
                  ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-500/20 scale-[1.03]"
                  : "border-purple-100 bg-white hover:border-purple-300 hover:bg-purple-50/50 shadow-sm"
              }`}
            >
              {isCurrent && (
                <div className="absolute top-2 start-2 flex items-center gap-1">
                  <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-amber-600 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.emoji}</span>
                <div className="text-left">
                  <span className="text-xl font-black text-purple-900 block leading-none">{item.sound}</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">{item.label}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 block group-hover:text-purple-700 transition-colors">
                    {item.exampleWord}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">{item.translation}</span>
                </div>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isCurrent ? "bg-amber-500 text-white" : "bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white"
                }`}>
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
