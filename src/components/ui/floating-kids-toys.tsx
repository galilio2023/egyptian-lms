"use client";

import { toast } from "sonner";
import { 
  ToyHappyPearSvg, 
  ToyDinoDinoSvg, 
  ToyAlligatorGatorSvg, 
  ToyTeddyBearSvg, 
  ToyPrincessUnicornSvg, 
  ToyRocketShuttleSvg, 
  ToyStackingBlocksSvg,
  ToyMagmaAppleSvg
} from "@/components/ui/illustrated-icons";

// Helper function: Friendly Kids English Pronunciation & Sound Effect
function playToySound(toyNameEn: string, phonicsSentence: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${toyNameEn}! ${phonicsSentence}`);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Slow and clear for primary learners
      utterance.pitch = 1.25; // Warm, cheerful tone
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }
  toast.success(`🔊 ${toyNameEn}: "${phonicsSentence}"`, {
    duration: 2500,
  });
}

// Full Magical Playground for Hero Sections — Fully Responsive across Mobile, Tablet & Desktop
export function FloatingKidsToysHeroDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      
      {/* ================= RIGHT WING (Emerald Dino & Smart Gator) ================= */}

      {/* 1. Top-Right: Smiling Emerald Dino (Responsive: w-16 on mobile, w-28 on tablet, w-40 on desktop) */}
      <div 
        onClick={() => playToySound("Dinosaur", "D says duh, duh, Dinosaur!")}
        className="absolute top-2 end-2 sm:top-6 sm:end-8 lg:end-14 animate-float-slow transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي لداينو 🦕"
      >
        <div className="relative group text-center">
          <div className="w-16 h-16 sm:w-28 sm:h-28 lg:w-40 lg:h-40 drop-shadow-2xl">
            <ToyDinoDinoSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-emerald-500/30 border border-white group-hover:scale-105 transition-transform">
            Dino Roar! 🦕 داينو
          </span>
        </div>
      </div>

      {/* 2. Mid-Right: Friendly Alligator with Glasses (Visible on ALL devices) */}
      <div 
        onClick={() => playToySound("Alligator", "A says ah, ah, Alligator!")}
        className="absolute top-[38%] -translate-y-1/2 end-1.5 sm:end-8 lg:end-14 animate-toy-wiggle transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي للتمساح 🐊"
      >
        <div className="relative group text-center">
          <div className="w-14 h-14 sm:w-28 sm:h-28 lg:w-38 lg:h-38 drop-shadow-2xl">
            <ToyAlligatorGatorSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-green-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-green-600/30 border border-white group-hover:scale-105 transition-transform">
            Smart Gator! 🐊 تمساح
          </span>
        </div>
      </div>

      {/* 3. Bottom-Right: Dreamy Princess Unicorn (Visible on ALL devices) */}
      <div 
        onClick={() => playToySound("Magic Unicorn", "U says yoo, Unicorn!")}
        className="absolute top-[72%] -translate-y-1/2 end-1.5 sm:bottom-6 sm:top-auto sm:end-8 lg:end-16 animate-float-reverse transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي لليونيكورن 🦄"
      >
        <div className="relative group text-center">
          <div className="w-14 h-14 sm:w-28 sm:h-28 lg:w-36 lg:h-36 drop-shadow-2xl">
            <ToyPrincessUnicornSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-pink-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-pink-500/30 border border-white group-hover:scale-105 transition-transform">
            Magic Unicorn! 🦄 يونيكورن
          </span>
        </div>
      </div>

      {/* ================= LEFT WING (Pear, Magma Apple & Teddy Bear) ================= */}

      {/* 4. Top-Left: Joyful Happy Pear (Responsive: w-16 on mobile, w-28 on tablet, w-40 on desktop) */}
      <div 
        onClick={() => playToySound("Pear", "P says puh, puh, Pear!")}
        className="absolute top-2 start-1.5 sm:top-6 sm:start-8 lg:start-14 animate-float-reverse transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي للكمثرى 🍐"
      >
        <div className="relative group text-center">
          <div className="w-16 h-16 sm:w-28 sm:h-28 lg:w-40 lg:h-40 drop-shadow-2xl">
            <ToyHappyPearSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-lime-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-lime-500/30 border border-white group-hover:scale-105 transition-transform">
            P is for Pear! 🍐 كمثرى
          </span>
        </div>
      </div>

      {/* 5. Mid-Left: Fiery Magma Apple */}
      <div 
        onClick={() => playToySound("Magma Apple", "A says ah, ah, Apple!")}
        className="absolute top-[38%] -translate-y-1/2 start-1.5 sm:start-8 lg:start-14 animate-pulse-soft transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي لتفاحة ماجما 🍎"
      >
        <div className="relative group text-center">
          <div className="w-16 h-16 sm:w-28 sm:h-28 lg:w-38 lg:h-38 drop-shadow-2xl">
            <ToyMagmaAppleSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-3 py-0.5 rounded-full shadow-lg shadow-red-600/30 border border-amber-200 group-hover:scale-105 transition-transform">
            Magma Apple! 🍎🔥 ماجما
          </span>
        </div>
      </div>

      {/* 6. Lower-Left: Fluffy Honey Teddy Bear (Visible on ALL devices) */}
      <div 
        onClick={() => playToySound("Teddy Bear", "B says buh, buh, Bear!")}
        className="absolute top-[72%] -translate-y-1/2 start-1.5 sm:start-8 lg:start-14 animate-float-slow transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي لدبدوب تيدي 🧸"
      >
        <div className="relative group text-center">
          <div className="w-14 h-14 sm:w-28 sm:h-28 lg:w-36 lg:h-36 drop-shadow-2xl">
            <ToyTeddyBearSvg className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block mt-1 whitespace-nowrap bg-amber-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30 border border-white group-hover:scale-105 transition-transform">
            Teddy Bear! 🧸 دبدوب
          </span>
        </div>
      </div>

      {/* 7. Bottom-Left: Cheerful Adventure Rocket (Desktop Only) */}
      <div 
        onClick={() => playToySound("Rocket", "R says rrr, Rocket blast off!")}
        className="hidden lg:block absolute bottom-6 start-8 lg:start-16 animate-float-slow transition-transform hover:scale-110 active:scale-90 active:rotate-3 pointer-events-auto z-10 cursor-pointer"
        title="انقر للاستماع للنطق الصوتي للصاروخ 🚀"
      >
        <div className="relative group text-center">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 drop-shadow-2xl">
            <ToyRocketShuttleSvg className="w-full h-full" />
          </div>
          <span className="inline-block mt-1 whitespace-nowrap bg-sky-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-sky-500/30 border border-white group-hover:scale-105 transition-transform">
            Blast Off! 🚀 صاروخ
          </span>
        </div>
      </div>

    </div>
  );
}

// 100% Non-Scrolling Kids Toys Interactive Phonics Sound Strip
export function KidsToysMiniStrip() {
  const toys = [
    { name: "تفاحة ماجما 🍎🔥", subtitle: "Magma Apple", phonics: "A says ah, ah, Apple!", Component: ToyMagmaAppleSvg, color: "border-red-300 bg-red-50/90 text-red-900" },
    { name: "داينو البطل 🦕", subtitle: "Emerald Dino", phonics: "D says duh, duh, Dinosaur!", Component: ToyDinoDinoSvg, color: "border-emerald-300 bg-emerald-50/90 text-emerald-900" },
    { name: "تمساح شاطر 🐊", subtitle: "Smart Gator", phonics: "A says ah, ah, Alligator!", Component: ToyAlligatorGatorSvg, color: "border-green-300 bg-green-50/90 text-green-900" },
    { name: "كمثرى سعيدة 🍐", subtitle: "Happy Pear", phonics: "P says puh, puh, Pear!", Component: ToyHappyPearSvg, color: "border-lime-300 bg-lime-50/90 text-lime-900" },
    { name: "دبدوب تيدي 🧸", subtitle: "Teddy Bear", phonics: "B says buh, buh, Bear!", Component: ToyTeddyBearSvg, color: "border-amber-300 bg-amber-50/90 text-amber-900" },
    { name: "يونيكورن سحري 🦄", subtitle: "Magic Pony", phonics: "U says yoo, Unicorn!", Component: ToyPrincessUnicornSvg, color: "border-pink-300 bg-pink-50/90 text-pink-900" },
    { name: "صاروخ الفضاء 🚀", subtitle: "Space Rocket", phonics: "R says rrr, Rocket!", Component: ToyRocketShuttleSvg, color: "border-sky-300 bg-sky-50/90 text-sky-900" },
    { name: "مكعبات الحروف 🔤", subtitle: "ABC Blocks", phonics: "A, B, C, let's learn English!", Component: ToyStackingBlocksSvg, color: "border-purple-300 bg-purple-50/90 text-purple-900" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-3 px-2 select-none w-full max-w-5xl mx-auto">
      {toys.map((toy, idx) => {
        const SvgComp = toy.Component;
        return (
          <div
            key={idx}
            onClick={() => playToySound(toy.subtitle, toy.phonics)}
            className={`p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 ${toy.color} shadow-sm hover:scale-110 active:scale-90 active:rotate-2 hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center flex flex-col items-center gap-1 backdrop-blur-md group shrink-0 w-22 sm:w-26 touch-manipulation`}
            title={`انقر لنطق ${toy.name}`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md group-hover:scale-110 transition-transform">
              <SvgComp className="w-full h-full" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black block leading-tight">{toy.name}</span>
            <span className="text-[8px] sm:text-[9px] font-bold opacity-75 block">{toy.subtitle}</span>
          </div>
        );
      })}
    </div>
  );
}
