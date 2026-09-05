import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
}

// 1. Elite Academy Brand Graduation Logo (Multi-layered 3D Gradient Cap + Gold Star + Sparkles)
export function EliteLogoBadge({ className = "w-10 h-10", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer rounded pill backdrop (Vibrant violet-pink) */}
      <rect width="100" height="100" rx="28" fill="url(#bgGrad)" filter="url(#glow)" />
      
      {/* Decorative stars / glimmers */}
      <circle cx="22" cy="24" r="2.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="80" cy="30" r="3" fill="#FDE047" opacity="0.9" />
      <path d="M78 20L80 25L85 27L80 29L78 34L76 29L71 27L76 25Z" fill="#FDE047" />

      {/* Open Book Base in soft white */}
      <path d="M50 78 C40 75 28 74 20 77 V64 C28 62 40 63 50 66 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M50 78 C60 75 72 74 80 77 V64 C72 62 60 63 50 66 Z" fill="#FFFFFF" opacity="0.8" />

      {/* Graduation Cap Rhombus Diamond */}
      <path
        d="M50 30L82 43L50 56L18 43Z"
        fill="url(#capGrad)"
        stroke="#FDE047"
        strokeWidth="1.8"
      />
      {/* Cap Under-Brim */}
      <path
        d="M32 50V63C32 67 40 71 50 71C60 71 68 67 68 63V50C62 55 56 57 50 57C44 57 38 55 32 50Z"
        fill="#6D28D9"
      />
      <path
        d="M32 50C38 55 44 57 50 57C56 57 62 55 68 50V54C68 58 60 62 50 62C40 62 32 58 32 54Z"
        fill="#7C3AED"
      />

      {/* Golden Button and Tassel */}
      <circle cx="50" cy="43" r="3.5" fill="url(#goldGrad)" />
      <path
        d="M50 43C56 46 62 50 65 57C66 59 66 62 65 65"
        stroke="url(#goldGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tassel fringe */}
      <path d="M63 65L67 65L68 74L62 74Z" fill="url(#goldGrad)" rx="1" />
      <circle cx="65" cy="74" r="1.5" fill="#FDE047" />
    </svg>
  );
}

// 2. Champion Trophy Cup (Glossy Golden Trophy + Diamond Sparks + Emerald Wreath)
export function ChampionCupSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="trophyBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
        <filter id="trophyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#EAB308" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ambient background glow ring */}
      <circle cx="50" cy="46" r="36" fill="#FEF9C3" opacity="0.4" />

      {/* Trophy Handles */}
      <path
        d="M26 26C15 26 15 48 30 52M74 26C85 26 85 48 70 52"
        stroke="url(#trophyGold)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Main Cup Body */}
      <path
        d="M27 20H73V44C73 57 63 67 50 67C37 67 27 57 27 44V20Z"
        fill="url(#trophyGold)"
        filter="url(#trophyGlow)"
      />
      {/* Cup Specular Highlight */}
      <path
        d="M32 23H40V43C40 50 36 55 32 57V23Z"
        fill="#FFFFFF"
        opacity="0.35"
      />

      {/* Trophy Stem */}
      <path d="M44 67H56V77H44Z" fill="url(#trophyGold)" />
      {/* Trophy Pedestal Base */}
      <path d="M36 77H64L68 88H32L36 77Z" fill="url(#trophyBase)" />
      <rect x="38" y="79" width="24" height="6" rx="2" fill="url(#trophyGold)" opacity="0.9" />

      {/* Star on Cup Center */}
      <path
        d="M50 32L53 39L60 40L55 45L56 52L50 48L44 52L45 45L40 40L47 39Z"
        fill="#FFFFFF"
      />

      {/* Twinkle Sparkles */}
      <path d="M72 14L74 19L79 21L74 23L72 28L70 23L65 21L70 19Z" fill="url(#sparkleGrad)" />
      <path d="M22 36L23 39L26 40L23 41L22 44L21 41L18 40L21 39Z" fill="url(#sparkleGrad)" />
    </svg>
  );
}

// 3. Phonics & English Speech (Soundwaves, Fun Megaphone / Microphone, Letter Magic)
export function PhonicsSpeechSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>

      {/* Soft circular aura */}
      <circle cx="50" cy="50" r="42" fill="#EEF2FF" />

      {/* Speaker Horn */}
      <path
        d="M20 40H32L46 27V73L32 60H20C17.8 60 16 58.2 16 56V44C16 41.8 17.8 40 20 40Z"
        fill="url(#phGrad)"
      />
      {/* Sound Waves */}
      <path
        d="M56 36C61 40 64 45 64 50C64 55 61 60 56 64"
        stroke="url(#waveGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M66 28C74 34 78 42 78 50C78 58 74 66 66 72"
        stroke="url(#waveGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M76 20C86 28 92 39 92 50C92 61 86 72 76 80"
        stroke="url(#waveGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Floating Phonics Letters A, B, C */}
      <rect x="62" y="14" width="16" height="16" rx="4" fill="#F43F5E" />
      <text x="70" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>
      
      <rect x="74" y="66" width="16" height="16" rx="4" fill="#10B981" />
      <text x="82" y="78" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B</text>
    </svg>
  );
}

// 4. Protected DRM Video Player (Holographic Video Screen + Cyber Shield + Laser Play)
export function DrmVideoShieldSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Screen Monitor Outline */}
      <rect x="12" y="18" width="76" height="52" rx="12" fill="url(#screenGrad)" stroke="#334155" strokeWidth="2.5" />
      {/* Monitor Stand */}
      <path d="M44 70H56V80H44Z" fill="#334155" />
      <path d="M32 80H68" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

      {/* Glowing Video Play Button */}
      <circle cx="44" cy="44" r="14" fill="url(#playGrad)" />
      <path d="M41 38L51 44L41 50Z" fill="#FFFFFF" />

      {/* Floating Emerald Security Shield Badge */}
      <g transform="translate(48, 36)">
        <path
          d="M20 6L38 12V24C38 35 29 44 20 48C11 44 2 35 2 24V12L20 6Z"
          fill="url(#shieldGrad)"
          stroke="#A7F3D0"
          strokeWidth="2"
        />
        {/* Checkmark inside Shield */}
        <path
          d="M12 24L17 29L28 18"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// 5. Egyptian Mobile Wallet & InstaPay (Mobile, Cash Banknotes, Meeza Card, Instant Transfer)
export function EgyptianWalletSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="instapayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="cashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Floating Banknote */}
      <rect x="36" y="16" width="50" height="28" rx="6" fill="url(#cashGrad)" transform="rotate(8 61 30)" />
      <circle cx="61" cy="30" r="6" fill="#A7F3D0" opacity="0.6" transform="rotate(8 61 30)" />

      {/* Smartphone */}
      <rect x="18" y="24" width="46" height="66" rx="10" fill="url(#phoneBody)" stroke="#475569" strokeWidth="2.5" />
      <rect x="23" y="32" width="36" height="48" rx="5" fill="#F8FAFC" />
      <circle cx="41" cy="28" r="1.5" fill="#94A3B8" />

      {/* InstaPay / Wallet Logo on Screen */}
      <rect x="27" y="38" width="28" height="20" rx="6" fill="url(#instapayGrad)" />
      <path d="M34 48L39 44V53M39 44L47 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="27" y="62" width="28" height="4" rx="2" fill="#E2E8F0" />
      <rect x="27" y="69" width="18" height="4" rx="2" fill="#CBD5E1" />

      {/* Currency Pill: EGP / ج.م */}
      <g transform="translate(56, 56)">
        <rect width="36" height="24" rx="12" fill="#F59E0B" />
        <text x="18" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">EGP</text>
      </g>
    </svg>
  );
}

// 6. Scratch Card / Voucher Ticket (Golden Center Card, Perforated, Secret Code Sparkles)
export function CenterVoucherCardSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="ticketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="goldScratch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Ticket Base Card */}
      <rect x="14" y="24" width="72" height="52" rx="12" fill="url(#ticketGrad)" />

      {/* Perforated Center Dividers */}
      <circle cx="14" cy="50" r="7" fill="#F8FAFC" />
      <circle cx="86" cy="50" r="7" fill="#F8FAFC" />
      <line x1="28" y1="50" x2="72" y2="50" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

      {/* Top Banner */}
      <text x="50" y="42" fill="#EEF2FF" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">ELITE CENTER CARD</text>

      {/* Golden Scratch Foil Strip */}
      <rect x="25" y="56" width="50" height="14" rx="4" fill="url(#goldScratch)" />
      <text x="50" y="66" fill="#78350F" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="2">••••••••</text>

      {/* Stars on Card */}
      <path d="M24 32L25 35L28 36L25 37L24 40L23 37L20 36L23 35Z" fill="#FDE047" />
      <path d="M74 34L75 36L77 37L75 38L74 40L73 38L71 37L73 36Z" fill="#FDE047" />
    </svg>
  );
}

// 7. Interactive Exam Sheet & Anti-Cheat Quiz Engine
export function ExamQuizSheetSvg({ className = "w-12 h-12", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="sheetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Folded Paper Sheet */}
      <rect x="20" y="16" width="60" height="70" rx="8" fill="url(#sheetGrad)" stroke="#CBD5E1" strokeWidth="2" />
      
      {/* Question lines */}
      <line x1="28" y1="30" x2="60" y2="30" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="42" r="3" fill="#6366F1" />
      <line x1="40" y1="42" x2="70" y2="42" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      
      <circle cx="32" cy="54" r="3" fill="#10B981" />
      <line x1="40" y1="54" x2="65" y2="54" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Grade Seal 100% */}
      <circle cx="64" cy="68" r="14" fill="#EF4444" opacity="0.9" />
      <text x="64" y="72" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">100%</text>

      {/* Floating Stopwatch Timer */}
      <g transform="translate(60, 8)">
        <circle cx="16" cy="16" r="14" fill="url(#timerGrad)" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M16 8V16L21 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 8. Streak Fire Flame (Blazing Fire with Multi-stop Energy Gradient)
export function StreakFlameSvg({ className = "w-8 h-8", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="fireOuter" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="fireInner" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Outer Flame */}
      <path
        d="M50 12C50 12 66 32 66 48C66 66 58 78 50 86C42 78 34 66 34 48C34 32 50 12 50 12Z"
        fill="url(#fireOuter)"
      />
      {/* Side flicks */}
      <path
        d="M50 86C68 86 82 72 82 54C82 40 74 30 68 24C72 36 68 50 56 56C58 48 56 38 50 30C44 38 42 48 44 56C32 50 28 36 32 24C26 30 18 40 18 54C18 72 32 86 50 86Z"
        fill="url(#fireOuter)"
      />
      {/* Core Hot Yellow Flame */}
      <path
        d="M50 42C54 50 56 56 56 64C56 74 52 82 50 84C48 82 44 74 44 64C44 56 46 50 50 42Z"
        fill="url(#fireInner)"
      />
      <circle cx="50" cy="74" r="5" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

// 9. XP Crystal Gem / Diamond (Faceted Jewel with Glowing Light Reflection)
export function XpGemSvg({ className = "w-8 h-8", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="gemTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="gemFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="gemBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Top Table */}
      <polygon points="32,24 68,24 82,44 18,44" fill="url(#gemTop)" />
      {/* Center Bright Facet */}
      <polygon points="32,24 68,24 50,44" fill="#E9D5FF" opacity="0.7" />
      {/* Left and Right Top Triangles */}
      <polygon points="18,44 32,24 50,44" fill="url(#gemFacet)" />
      <polygon points="82,44 68,24 50,44" fill="url(#gemFacet)" opacity="0.9" />

      {/* Lower Pavilion Facets */}
      <polygon points="18,44 50,86 50,44" fill="url(#gemBottom)" />
      <polygon points="82,44 50,86 50,44" fill="url(#gemFacet)" />
      <polygon points="36,44 50,86 64,44" fill="#A855F7" />

      {/* Sparkle Glint */}
      <path d="M72 16L74 21L79 23L74 25L72 30L70 25L65 23L70 21Z" fill="#FFFFFF" />
    </svg>
  );
}

// 10. WhatsApp Messaging Bubble (Neon Emerald + Speech Notch + Ripple)
export function WhatsAppBubbleSvg({ className = "w-10 h-10", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>
        <filter id="waShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#25D366" floodOpacity="0.45" />
        </filter>
      </defs>

      <circle cx="50" cy="50" r="42" fill="url(#waGrad)" filter="url(#waShadow)" />
      
      {/* Tail notch */}
      <path d="M30 68L26 80L38 76" fill="#128C7E" />

      {/* Phone Handset Icon */}
      <path
        d="M66 58C65 57 62 55 60 54C58 53 57 53 56 55C55 57 53 58 52 58C50 57 47 55 45 53C43 51 41 48 40 46C40 45 41 43 43 42C45 41 45 40 44 38C43 36 41 33 40 32C38 31 37 31 36 32C34 33 32 35 32 37C32 40 34 45 38 50C42 55 47 58 52 60C55 61 57 60 59 58C61 56 62 54 63 53C64 52 64 51 63 50C62 49 61 48 60 47"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 11. Worksheets & Study Notes PDF Binder
export function WorksheetPdfSvg({ className = "w-10 h-10", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="pdfPill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Folder Back */}
      <path d="M16 26C16 22 19 19 23 19H42L48 26H77C81 26 84 29 84 33V75C84 79 81 82 77 82H23C19 82 16 79 16 75V26Z" fill="url(#folderGrad)" />
      
      {/* Paper sticking out */}
      <rect x="24" y="28" width="52" height="40" rx="4" fill="#FFFFFF" />
      <line x1="32" y1="36" x2="68" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="44" x2="60" y2="44" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="52" x2="52" y2="52" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* PDF Red Badge */}
      <rect x="52" y="58" width="30" height="18" rx="6" fill="url(#pdfPill)" />
      <text x="67" y="70" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">PDF</text>
    </svg>
  );
}

// 12. Student Mascots (Lion, Falcon, Rocket, Star)
export function MascotLionSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="42" fill="#FEF3C7" />
      {/* Mane */}
      <circle cx="50" cy="50" r="30" fill="#F59E0B" />
      {/* Face */}
      <circle cx="50" cy="52" r="22" fill="#FDE68A" />
      {/* Ears */}
      <circle cx="34" cy="30" r="7" fill="#F59E0B" />
      <circle cx="34" cy="30" r="4" fill="#FDE68A" />
      <circle cx="66" cy="30" r="7" fill="#F59E0B" />
      <circle cx="66" cy="30" r="4" fill="#FDE68A" />
      {/* Eyes */}
      <circle cx="43" cy="50" r="3" fill="#1E293B" />
      <circle cx="57" cy="50" r="3" fill="#1E293B" />
      <circle cx="44" cy="49" r="1" fill="#FFFFFF" />
      <circle cx="58" cy="49" r="1" fill="#FFFFFF" />
      {/* Nose and Smile */}
      <polygon points="50,56 46,53 54,53" fill="#78350F" />
      <path d="M46 58C48 61 52 61 54 58" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      {/* Little Crown */}
      <path d="M42 28L46 32L50 26L54 32L58 28V36H42V28Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </svg>
  );
}

export function MascotFalconSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="42" fill="#ECFDF5" />
      {/* Falcon Head & Wings */}
      <path d="M26 62C26 40 40 28 56 28C68 28 76 36 76 50C76 66 60 76 44 76C34 76 26 70 26 62Z" fill="#10B981" />
      {/* Golden Beak */}
      <path d="M68 44L84 52L68 56Z" fill="#F59E0B" />
      {/* Eye with Horus aura */}
      <circle cx="58" cy="42" r="5" fill="#047857" />
      <circle cx="58" cy="42" r="3" fill="#FFFFFF" />
      <circle cx="59" cy="42" r="1.5" fill="#0F172A" />
    </svg>
  );
}

export function MascotRocketSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="42" fill="#EFF6FF" />
      {/* Flame trail */}
      <path d="M44 68L50 88L56 68Z" fill="#EF4444" />
      <path d="M46 68L50 82L54 68Z" fill="#FACC15" />
      {/* Rocket Body */}
      <path d="M50 18C40 32 38 52 38 68H62C62 52 60 32 50 18Z" fill="#3B82F6" />
      {/* Nose cone */}
      <path d="M50 18C44 26 42 34 40 40H60C58 34 56 26 50 18Z" fill="#EF4444" />
      {/* Porthole */}
      <circle cx="50" cy="48" r="7" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="2" />
      <circle cx="50" cy="48" r="4" fill="#38BDF8" />
      {/* Fins */}
      <path d="M38 54L26 68H38V54Z" fill="#EF4444" />
      <path d="M62 54L74 68H62V54Z" fill="#EF4444" />
    </svg>
  );
}

export function MascotStarSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="42" fill="#FEF9C3" />
      {/* Star Shape */}
      <path
        d="M50 18L58 36L78 38L62 52L68 72L50 60L32 72L38 52L22 38L42 36Z"
        fill="#FACC15"
        stroke="#EAB308"
        strokeWidth="2"
      />
      {/* Cheerful Face */}
      <circle cx="44" cy="44" r="2.5" fill="#713F12" />
      <circle cx="56" cy="44" r="2.5" fill="#713F12" />
      <path d="M46 50C48 53 52 53 54 50" stroke="#713F12" strokeWidth="2" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="40" cy="48" r="2" fill="#F43F5E" opacity="0.6" />
      <circle cx="60" cy="48" r="2" fill="#F43F5E" opacity="0.6" />
    </svg>
  );
}

// 13. Student Login Golden Key (3D Key + Glowing Lock + Sparkles)
export function StudentLoginKeySvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="keyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="keyAura" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#keyAura)" opacity="0.15" />
      {/* Key Bow Head */}
      <circle cx="38" cy="38" r="18" fill="url(#keyGold)" stroke="#B45309" strokeWidth="2" />
      <circle cx="38" cy="38" r="8" fill="#FFFFFF" />
      {/* Key Shaft */}
      <path d="M51 51L78 78" stroke="url(#keyGold)" strokeWidth="8" strokeLinecap="round" />
      {/* Key Bits */}
      <path d="M68 68L76 60M74 74L82 66" stroke="url(#keyGold)" strokeWidth="6" strokeLinecap="round" />
      {/* Sparkles */}
      <path d="M72 24L74 29L79 31L74 33L72 38L70 33L65 31L70 29Z" fill="#FDE047" />
    </svg>
  );
}

// 14. Student Registration Rocket Pencil (Creative Learning + Ruler + Star)
export function StudentRegisterPencilSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="pencBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#FDF4FF" />
      {/* Ruler in background */}
      <rect x="22" y="58" width="56" height="14" rx="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(-25 50 65)" />
      <line x1="30" y1="62" x2="30" y2="67" stroke="#713F12" strokeWidth="1.5" transform="rotate(-25 50 65)" />
      <line x1="40" y1="62" x2="40" y2="67" stroke="#713F12" strokeWidth="1.5" transform="rotate(-25 50 65)" />
      <line x1="50" y1="62" x2="50" y2="67" stroke="#713F12" strokeWidth="1.5" transform="rotate(-25 50 65)" />
      {/* Rocket Pencil Body */}
      <path d="M35 75L72 38L62 28L25 65L35 75Z" fill="url(#pencBody)" />
      {/* Wood cone & tip */}
      <polygon points="25,65 35,75 16,84" fill="#FDE68A" />
      <polygon points="19,81 22,82 16,84" fill="#1E293B" />
      {/* Eraser */}
      <path d="M62 28L72 38L78 32C81 29 81 24 78 21C75 18 70 18 67 21L62 28Z" fill="#F43F5E" />
      <path d="M80 50L82 54L86 56L82 58L80 62L78 58L74 56L78 54Z" fill="#FACC15" />
    </svg>
  );
}

// 15. Curriculum Open Book (English Storybook + Golden Stars + Bookmark)
export function CurriculumBookSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#EEF2FF" />
      {/* Book Cover */}
      <path d="M16 68C28 64 42 66 50 72C58 66 72 64 84 68V28C72 24 58 26 50 32C42 26 28 24 16 28V68Z" fill="url(#bookCover)" />
      {/* Book Pages */}
      <path d="M18 65C30 61 42 63 49 69V30C42 24 30 22 18 26V65Z" fill="#FFFFFF" />
      <path d="M82 65C70 61 58 63 51 69V30C58 24 70 22 82 26V65Z" fill="#F8FAFC" />
      {/* Ribbon Bookmark */}
      <path d="M50 30V54L54 50L58 54V30Z" fill="#F59E0B" />
      {/* Floating Letters */}
      <text x="32" y="46" fill="#6366F1" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Aa</text>
      <text x="66" y="46" fill="#EC4899" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Bb</text>
    </svg>
  );
}

// 16. Admin CMS Shield & Golden Crown (Executive Authority)
export function AdminShieldCrownSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#F5F3FF" />
      {/* Shield */}
      <path d="M50 16L78 28V52C78 68 64 80 50 86C36 80 22 68 22 52V28L50 16Z" fill="url(#adminGrad)" />
      {/* Crown */}
      <path d="M34 56L38 42L44 48L50 36L56 48L62 42L66 56H34Z" fill="url(#crownGrad)" stroke="#B45309" strokeWidth="1" />
      <circle cx="50" cy="36" r="2" fill="#FFFFFF" />
      <circle cx="38" cy="42" r="1.5" fill="#FFFFFF" />
      <circle cx="62" cy="42" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

// 17. Broadcast Notification Megaphone
export function BroadcastMegaphoneSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="megaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#FFF1F2" />
      {/* Horn */}
      <path d="M26 44H38L56 26V74L38 56H26C23 56 20 53 20 50V50C20 47 23 44 26 44Z" fill="url(#megaGrad)" />
      {/* Handle */}
      <path d="M36 56L32 72H40L44 56" fill="#BE123C" />
      {/* Waves */}
      <path d="M64 40C68 44 70 47 70 50C70 53 68 56 64 60" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
      <path d="M74 32C80 38 84 44 84 50C84 56 80 62 74 68" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="76" cy="22" r="3" fill="#F59E0B" />
    </svg>
  );
}

// 18. Students Group Avatar
export function UsersGraduationSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="userGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="userGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#F5F3FF" />
      {/* Center Student */}
      <circle cx="50" cy="38" r="14" fill="#FDE68A" />
      <path d="M50 20L64 28L50 34L36 28Z" fill="#1E1B4B" />
      <path d="M28 78C28 66 38 58 50 58C62 58 72 66 72 78H28Z" fill="url(#userGrad1)" />
      {/* Left Student */}
      <circle cx="28" cy="44" r="10" fill="#FDE68A" />
      <path d="M14 78C14 69 22 63 30 63H34C32 67 30 73 30 78H14Z" fill="url(#userGrad2)" opacity="0.8" />
      {/* Right Student */}
      <circle cx="72" cy="44" r="10" fill="#FDE68A" />
      <path d="M86 78C86 69 78 63 70 63H66C68 67 70 73 70 78H86Z" fill="#10B981" opacity="0.8" />
    </svg>
  );
}

// 19. Egyptian Phone Signal (010, 011, 012, 015 SIM & Antenna)
export function EgyptianPhoneSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="simGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#ECFDF5" />
      {/* Phone Silhouette */}
      <rect x="30" y="20" width="40" height="60" rx="8" fill="#1E293B" />
      <rect x="34" y="26" width="32" height="42" rx="4" fill="#FFFFFF" />
      <circle cx="50" cy="74" r="2.5" fill="#94A3B8" />
      {/* SIM Card chip overlay */}
      <rect x="40" y="34" width="20" height="26" rx="3" fill="url(#simGrad)" />
      <path d="M45 42H55M45 47H55M45 52H55" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

// 20. Security Cyber Lock (Keyhole + Shield Protection)
export function SecurityLockSvg({ className = "w-10 h-10" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="lockBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#FEF3C7" />
      {/* Shackle */}
      <path d="M36 46V32C36 24 42 18 50 18C58 18 64 24 64 32V46" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
      {/* Padlock Body */}
      <rect x="26" y="44" width="48" height="38" rx="8" fill="url(#lockBody)" />
      {/* Keyhole */}
      <circle cx="50" cy="60" r="5" fill="#78350F" />
      <polygon points="48,60 52,60 54,72 46,72" fill="#78350F" />
    </svg>
  );
}

// 21. YouTube Play Badge SVG (Glossy Red Screen + Diamond Highlights)
export function YouTubePlaySvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="ytGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="50%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
        <linearGradient id="ytGleam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Outer Soft Glow */}
      <rect x="8" y="16" width="84" height="68" rx="22" fill="#FEE2E2" />
      {/* Red Capsule */}
      <rect x="12" y="20" width="76" height="60" rx="18" fill="url(#ytGrad)" />
      {/* Top Gloss */}
      <path d="M12 36C12 27.1634 19.1634 20 28 20H72C80.8366 20 88 27.1634 88 36V42C72 40 40 42 12 48V36Z" fill="url(#ytGleam)" />
      {/* White Play Triangle */}
      <polygon points="42,36 42,64 66,50" fill="#FFFFFF" />
    </svg>
  );
}

// 22. Facebook Brand Badge SVG (Glossy Royal Blue Gradient + Bold Letter)
export function FacebookBadgeSvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="fbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="fbGloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="#DBEAFE" />
      <circle cx="50" cy="50" r="38" fill="url(#fbGrad)" />
      {/* Gloss Highlight */}
      <path d="M50 12C32 12 18 24 14 40C24 45 42 46 64 42C78 39 84 30 86 28C78 18 65 12 50 12Z" fill="url(#fbGloss)" />
      {/* White 'f' */}
      <path d="M56 36H63V26H53C47 26 43 30 43 36V44H36V54H43V88H53V54H62L64 44H53V38C53 36 54 36 56 36Z" fill="#FFFFFF" />
    </svg>
  );
}

// 23. Hotline Telephone SVG (Vibrant Indigo-Violet Handset with Sound Beams)
export function HotlinePhoneSvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="hotlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="#EDE9FE" />
      {/* Ringing Sound Wave Arcs */}
      <path d="M68 28C74 34 78 42 78 50C78 58 74 66 68 72" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 6" />
      <path d="M76 22C84 30 90 40 90 50C90 60 84 70 76 78" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 8" />
      {/* 3D Phone Handset */}
      <rect x="28" y="24" width="22" height="52" rx="10" transform="rotate(-25 39 50)" fill="url(#hotlineGrad)" />
      {/* Ear Speaker & Mic */}
      <circle cx="28" cy="30" r="7" fill="#FFFFFF" />
      <circle cx="52" cy="70" r="7" fill="#FFFFFF" />
      <circle cx="28" cy="30" r="3" fill="#6366F1" />
      <circle cx="52" cy="70" r="3" fill="#6366F1" />
    </svg>
  );
}

// 24. Official Shield Check SVG (Emerald Laurel + Star Checkmark)
export function OfficialShieldCheckSvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="shieldCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="#D1FAE5" />
      {/* Security Shield */}
      <path d="M50 16L72 26V48C72 63 62 76 50 82C38 76 28 63 28 48V26L50 16Z" fill="url(#shieldCheckGrad)" />
      {/* Inner White Checkmark */}
      <path d="M40 48L47 55L62 38" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Little Top Star */}
      <polygon points="50,22 52,26 56,27 53,30 54,34 50,32 46,34 47,30 44,27 48,26" fill="#FDE047" />
    </svg>
  );
}

// 25. Toy Happy Pear SVG (Joyful Smiling Pear with Rosy Cheeks & Sprout Leaf)
export function ToyHappyPearSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="pearBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="60%" stopColor="#84CC16" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>
        <linearGradient id="pearBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BEF264" />
          <stop offset="100%" stopColor="#A3E635" />
        </linearGradient>
      </defs>
      {/* Soft Drop Shadow Aura */}
      <ellipse cx="50" cy="88" rx="28" ry="6" fill="#D9F99D" opacity="0.6" />
      {/* Brown Stem & Green Leaf */}
      <path d="M50 20C50 13 54 8 58 6" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
      <path d="M53 14C61 10 68 12 70 18C64 22 56 20 53 14Z" fill="#22C55E" />
      {/* Pear Body Shape */}
      <path
        d="M50 20C42 20 37 28 35 37C32 50 22 58 22 72C22 84 34 92 50 92C66 92 78 84 78 72C78 58 68 50 65 37C63 28 58 20 50 20Z"
        fill="url(#pearBodyGrad)"
      />
      {/* Lighter Belly Glow */}
      <ellipse cx="50" cy="68" rx="18" ry="16" fill="url(#pearBellyGrad)" />
      {/* Big Cheerful Eyes */}
      <circle cx="43" cy="48" r="4.5" fill="#0F172A" />
      <circle cx="57" cy="48" r="4.5" fill="#0F172A" />
      <circle cx="44.5" cy="46.5" r="1.5" fill="#FFFFFF" />
      <circle cx="58.5" cy="46.5" r="1.5" fill="#FFFFFF" />
      {/* Sweet Rosy Cheeks */}
      <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />
      <ellipse cx="64" cy="54" rx="4" ry="2.5" fill="#FB7185" opacity="0.8" />
      {/* Smiling Mouth */}
      <path d="M45 56C47 60 53 60 55 56" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tiny Hand Waves */}
      <path d="M26 56C20 54 16 48 18 44" stroke="#65A30D" strokeWidth="4" strokeLinecap="round" />
      <path d="M74 56C80 54 84 48 82 44" stroke="#65A30D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// 26. Toy Dino Dinosaur SVG (Friendly Kawaii Emerald Baby Dino with Yellow Belly)
export function ToyDinoDinoSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="dinoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="dinoSpikes" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Floor Shadow */}
      <ellipse cx="50" cy="88" rx="26" ry="6" fill="#A7F3D0" opacity="0.6" />
      {/* Orange/Golden Spikes along back & tail */}
      <polygon points="32,22 36,14 42,22" fill="url(#dinoSpikes)" />
      <polygon points="24,32 26,24 32,32" fill="url(#dinoSpikes)" />
      <polygon points="20,44 18,36 26,44" fill="url(#dinoSpikes)" />
      <polygon points="18,58 14,52 22,60" fill="url(#dinoSpikes)" />
      <polygon points="12,70 6,66 16,72" fill="url(#dinoSpikes)" />
      {/* Dino Body & Tail */}
      <path
        d="M10 74C20 72 26 66 30 58C30 46 32 26 48 24C62 22 72 28 72 40C72 48 64 52 64 58C66 66 74 74 72 84C70 88 64 90 56 90C46 90 38 88 34 84C28 84 22 80 18 78L10 74Z"
        fill="url(#dinoBodyGrad)"
      />
      {/* Yellow Kawaii Belly */}
      <path
        d="M50 50C56 50 62 54 62 64C62 76 56 86 48 86C42 86 42 76 44 64C45 54 48 50 50 50Z"
        fill="#FEF08A"
      />
      {/* Big Curious Eye */}
      <circle cx="58" cy="34" r="5.5" fill="#FFFFFF" />
      <circle cx="60" cy="34" r="3.5" fill="#0F172A" />
      <circle cx="61.5" cy="32.5" r="1.5" fill="#FFFFFF" />
      {/* Rosy Dinosaur Cheek */}
      <ellipse cx="50" cy="40" rx="3.5" ry="2" fill="#F43F5E" opacity="0.7" />
      {/* Happy Open Smile */}
      <path d="M60 42C64 43 68 41 68 39" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cute Little Tiny Hands */}
      <path d="M52 56C56 58 60 58 62 56" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
      {/* Little Feet Claws */}
      <ellipse cx="44" cy="88" rx="6" ry="3" fill="#047857" />
      <ellipse cx="60" cy="88" rx="6" ry="3" fill="#047857" />
    </svg>
  );
}

// 27. Toy Alligator / Crocodile SVG (Cute Smiling Lime Gator with Little Specs)
export function ToyAlligatorGatorSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="gatorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      {/* Floor Shadow */}
      <ellipse cx="50" cy="86" rx="30" ry="6" fill="#BBF7D0" opacity="0.6" />
      {/* Gator Body */}
      <path
        d="M20 78C26 72 32 64 34 52C34 40 42 32 54 32C68 32 82 40 84 50C85 58 78 64 68 66C66 74 68 82 58 84C46 86 32 84 20 78Z"
        fill="url(#gatorGrad)"
      />
      {/* Ridges on Head & Back */}
      <circle cx="44" cy="28" r="4" fill="#15803D" />
      <circle cx="56" cy="28" r="4" fill="#15803D" />
      <circle cx="34" cy="40" r="3.5" fill="#15803D" />
      <circle cx="28" cy="50" r="3.5" fill="#15803D" />
      {/* Big Friendly Snout */}
      <path d="M50 44C65 44 86 46 88 56C88 64 72 68 56 68L50 44Z" fill="#4ADE80" />
      {/* Snout Nostril Dots */}
      <circle cx="82" cy="50" r="1.5" fill="#14532D" />
      <circle cx="85" cy="52" r="1.5" fill="#14532D" />
      {/* Little White Cartoon Teeth */}
      <polygon points="64,66 67,61 70,66" fill="#FFFFFF" />
      <polygon points="74,65 77,60 80,65" fill="#FFFFFF" />
      {/* Specs / Glasses (Student Alligator!) */}
      <circle cx="48" cy="38" r="6" stroke="#F59E0B" strokeWidth="2.5" fill="#FEF3C7" opacity="0.9" />
      <circle cx="62" cy="38" r="6" stroke="#F59E0B" strokeWidth="2.5" fill="#FEF3C7" opacity="0.9" />
      <path d="M54 38H56" stroke="#F59E0B" strokeWidth="2.5" />
      {/* Happy Eyes inside Glasses */}
      <circle cx="49" cy="38" r="3" fill="#0F172A" />
      <circle cx="63" cy="38" r="3" fill="#0F172A" />
      <circle cx="50" cy="37" r="1" fill="#FFFFFF" />
      <circle cx="64" cy="37" r="1" fill="#FFFFFF" />
      {/* Pink Cheek */}
      <ellipse cx="44" cy="48" rx="4" ry="2" fill="#F43F5E" opacity="0.7" />
      {/* Cute Feet */}
      <ellipse cx="40" cy="85" rx="7" ry="4" fill="#15803D" />
      <ellipse cx="58" cy="85" rx="7" ry="4" fill="#15803D" />
    </svg>
  );
}

// 28. Toy Teddy Bear SVG (Fluffy Honey Bear with Lavender Bow-tie & Cheerful Smile)
export function ToyTeddyBearSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="bearFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bowtieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      {/* Soft Drop Shadow */}
      <ellipse cx="50" cy="88" rx="26" ry="6" fill="#FDE68A" opacity="0.6" />
      {/* Left & Right Round Ears */}
      <circle cx="32" cy="24" r="12" fill="url(#bearFurGrad)" />
      <circle cx="32" cy="24" r="6" fill="#FDE68A" />
      <circle cx="68" cy="24" r="12" fill="url(#bearFurGrad)" />
      <circle cx="68" cy="24" r="6" fill="#FDE68A" />
      {/* Body */}
      <ellipse cx="50" cy="68" rx="24" ry="20" fill="url(#bearFurGrad)" />
      {/* Cream Belly */}
      <ellipse cx="50" cy="70" rx="14" ry="12" fill="#FEF3C7" />
      {/* Head */}
      <circle cx="50" cy="40" r="22" fill="url(#bearFurGrad)" />
      {/* Cream Muzzle */}
      <ellipse cx="50" cy="46" rx="10" ry="7" fill="#FEF3C7" />
      {/* Cute Brown Nose */}
      <ellipse cx="50" cy="43" rx="4" ry="3" fill="#78350F" />
      {/* Mouth */}
      <path d="M50 46V50M46 49C48 52 52 52 54 49" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      {/* Black Button Eyes */}
      <circle cx="42" cy="36" r="3.5" fill="#0F172A" />
      <circle cx="58" cy="36" r="3.5" fill="#0F172A" />
      <circle cx="43" cy="35" r="1" fill="#FFFFFF" />
      <circle cx="59" cy="35" r="1" fill="#FFFFFF" />
      {/* Sweet Blush */}
      <circle cx="34" cy="44" r="3" fill="#FB7185" opacity="0.8" />
      <circle cx="66" cy="44" r="3" fill="#FB7185" opacity="0.8" />
      {/* Purple Bow-Tie */}
      <polygon points="40,56 46,60 40,64" fill="url(#bowtieGrad)" />
      <polygon points="60,56 54,60 60,64" fill="url(#bowtieGrad)" />
      <circle cx="50" cy="60" r="3" fill="#7E22CE" />
      {/* Paws */}
      <ellipse cx="26" cy="64" rx="7" ry="5" fill="#D97706" />
      <ellipse cx="74" cy="64" rx="7" ry="5" fill="#D97706" />
      <ellipse cx="36" cy="85" rx="8" ry="5" fill="#D97706" />
      <ellipse cx="64" cy="85" rx="8" ry="5" fill="#D97706" />
    </svg>
  );
}

// 29. Toy Princess Unicorn SVG (Pastel Pink/Lavender Unicorn with Golden Horn)
export function ToyPrincessUnicornSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="unicornBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF4FF" />
          <stop offset="60%" stopColor="#F5D0FE" />
          <stop offset="100%" stopColor="#E879F9" />
        </linearGradient>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="maneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      {/* Aura */}
      <ellipse cx="50" cy="88" rx="28" ry="6" fill="#F5D0FE" opacity="0.6" />
      {/* Rainbow Mane */}
      <path d="M32 28C24 34 20 48 22 62C26 54 32 46 36 40Z" fill="url(#maneGrad)" />
      <path d="M26 42C20 50 18 64 22 74C28 66 32 58 34 50Z" fill="url(#maneGrad)" />
      {/* Body */}
      <path d="M30 60C30 50 38 46 48 46H56C68 46 76 56 76 68C76 78 68 86 56 86H44C34 86 30 74 30 60Z" fill="url(#unicornBody)" />
      {/* Head */}
      <path d="M44 48C40 44 42 32 46 26C52 18 64 20 70 26C78 34 80 44 76 50C70 54 60 52 52 50Z" fill="url(#unicornBody)" />
      {/* Golden Spiral Horn */}
      <polygon points="62,20 74,4 68,22" fill="url(#hornGrad)" />
      <line x1="65" y1="16" x2="68" y2="14" stroke="#CA8A04" strokeWidth="1.5" />
      <line x1="67" y1="11" x2="70" y2="9" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Cute Ear */}
      <path d="M50 20C48 14 52 12 56 16C54 20 52 22 50 20Z" fill="#F472B6" />
      {/* Dreamy Sleeping Eye with Eyelashes */}
      <path d="M62 34C64 37 68 37 70 34" stroke="#701A75" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="63" y1="36" x2="62" y2="39" stroke="#701A75" strokeWidth="1.5" />
      <line x1="66" y1="37" x2="66" y2="40" stroke="#701A75" strokeWidth="1.5" />
      <line x1="69" y1="36" x2="70" y2="39" stroke="#701A75" strokeWidth="1.5" />
      {/* Rosy Heart Cheek */}
      <circle cx="68" cy="42" r="3.5" fill="#FB7185" opacity="0.8" />
      {/* Sparkling Stars */}
      <polygon points="78,16 80,20 84,21 81,24 82,28 78,26 74,28 75,24 72,21 76,20" fill="#FDE047" />
      <polygon points="26,24 27,27 30,28 28,30 29,33 26,31 23,33 24,30 22,28 25,27" fill="#FDE047" />
    </svg>
  );
}

// 30. Toy Rocket Shuttle SVG (Cheerful Space Adventure Rocket for Boys & Girls)
export function ToyRocketShuttleSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>
        <linearGradient id="rocketFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      {/* Jet Flame */}
      <polygon points="50,72 40,88 47,84 50,96 53,84 60,88" fill="url(#flameGrad)" />
      {/* Red Fins */}
      <path d="M34 56C24 64 20 76 22 80C28 80 34 76 38 70V56H34Z" fill="url(#rocketFinGrad)" />
      <path d="M66 56C76 64 80 76 78 80C72 80 66 76 62 70V56H66Z" fill="url(#rocketFinGrad)" />
      {/* Rocket Main Capsule */}
      <path d="M50 10C38 26 34 46 34 72H66C66 46 62 26 50 10Z" fill="url(#rocketBodyGrad)" stroke="#0284C7" strokeWidth="2.5" />
      {/* Red Nose Cone */}
      <path d="M50 10C44 18 41 26 39 34H61C59 26 56 18 50 10Z" fill="url(#rocketFinGrad)" />
      {/* Blue Porthole Window with Happy Smile inside */}
      <circle cx="50" cy="48" r="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="48" cy="46" r="2" fill="#FFFFFF" />
      <path d="M46 51C48 54 52 54 54 51" stroke="#0C4A6E" strokeWidth="2" strokeLinecap="round" />
      {/* Speed Stars */}
      <polygon points="20,24 22,28 26,29 23,32 24,36 20,34 16,36 17,32 14,29 18,28" fill="#FDE047" />
      <polygon points="80,36 82,39 85,40 83,42 84,45 81,43 78,45 79,42 77,40 80,39" fill="#FDE047" />
    </svg>
  );
}

// 31. Toy Stacking Blocks SVG (ABC Candy Alphabet Cubes for Toddlers)
export function ToyStackingBlocksSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="blockRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient id="blockBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="blockYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Bottom Block B (Blue) */}
      <rect x="14" y="52" width="36" height="36" rx="8" fill="url(#blockBlue)" />
      <text x="32" y="77" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">B</text>
      {/* Bottom Block C (Yellow) */}
      <rect x="52" y="52" width="36" height="36" rx="8" fill="url(#blockYellow)" />
      <text x="70" y="77" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">C</text>
      {/* Top Block A (Red) */}
      <rect x="33" y="16" width="36" height="36" rx="8" fill="url(#blockRed)" />
      <text x="51" y="41" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">A</text>
    </svg>
  );
}

// 32. Toy Magma Apple SVG (Fiery Molten Lava Apple with Glowing Veins & Cheerful Smile)
export function ToyMagmaAppleSvg({ className = "w-12 h-12" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="magmaAppleBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="40%" stopColor="#EF4444" />
          <stop offset="80%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="magmaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="magmaLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Fiery Floor Shadow */}
      <ellipse cx="50" cy="90" rx="28" ry="6" fill="#FEE2E2" opacity="0.8" />
      {/* Brown Stem */}
      <path d="M50 24C50 16 53 10 57 8" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
      {/* Magma Flame Sprout Leaf */}
      <path d="M53 18C63 12 73 14 74 22C66 26 57 24 53 18Z" fill="url(#magmaLeaf)" />
      {/* Main Apple Body */}
      <path
        d="M50 26C42 18 20 20 18 42C16 64 30 84 48 88C50 88.5 50 88.5 52 88C70 84 84 64 82 42C80 20 58 18 50 26Z"
        fill="url(#magmaAppleBody)"
      />
      {/* Glowing Magma Veins & Molten Lava Cracks */}
      <path
        d="M24 46L30 52L26 62L34 70"
        stroke="url(#magmaGlow)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M76 46L70 52L74 62L66 70"
        stroke="url(#magmaGlow)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 76L50 82L56 76"
        stroke="url(#magmaGlow)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Molten Core Belly Glow */}
      <ellipse cx="50" cy="58" rx="14" ry="12" fill="#FEF08A" opacity="0.3" />
      {/* Big Friendly Kawaii Cartoon Eyes */}
      <circle cx="41" cy="46" r="5" fill="#18181B" />
      <circle cx="59" cy="46" r="5" fill="#18181B" />
      <circle cx="42.5" cy="44.5" r="2" fill="#FFFFFF" />
      <circle cx="60.5" cy="44.5" r="2" fill="#FFFFFF" />
      <circle cx="39.5" cy="47.5" r="1" fill="#FDE047" />
      <circle cx="57.5" cy="47.5" r="1" fill="#FDE047" />
      {/* Fiery Orange Cheeks */}
      <circle cx="33" cy="54" r="4.5" fill="#FDE047" opacity="0.9" />
      <circle cx="67" cy="54" r="4.5" fill="#FDE047" opacity="0.9" />
      {/* Sweet Smile */}
      <path d="M44 54C47 59 53 59 56 54" stroke="#450A0A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Molten Sparks & Embers */}
      <polygon points="16,30 18,34 22,35 19,38 20,42 16,40 12,42 13,38 10,35 14,34" fill="#FDE047" />
      <polygon points="84,28 86,31 89,32 87,34 88,38 84,36 81,38 82,34 80,32 83,31" fill="#FDE047" />
      <circle cx="78" cy="74" r="2.5" fill="#F97316" />
      <circle cx="22" cy="74" r="2.5" fill="#F97316" />
    </svg>
  );
}

// 33. Cartoon Menu Burger SVG (Chunky, Colorful Candy 3-Bar Menu Badge)
export function CartoonMenuBurgerSvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="burgerBar1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="burgerBar2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="burgerBar3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* Top Rounded Bar */}
      <rect x="14" y="22" width="72" height="14" rx="7" fill="url(#burgerBar1)" />
      <rect x="18" y="24" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
      {/* Middle Rounded Bar */}
      <rect x="14" y="43" width="72" height="14" rx="7" fill="url(#burgerBar2)" />
      <rect x="18" y="45" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
      {/* Bottom Rounded Bar */}
      <rect x="14" y="64" width="72" height="14" rx="7" fill="url(#burgerBar3)" />
      <rect x="18" y="66" width="28" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
    </svg>
  );
}

// 34. Cartoon Close Cross SVG (Chunky Candy X with Soft Highlights)
export function CartoonCloseCrossSvg({ className = "w-8 h-8" }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Circular Soft Background */}
      <circle cx="50" cy="50" r="44" fill="#FEE2E2" />
      {/* Diagonal 1 */}
      <rect
        x="24"
        y="43"
        width="52"
        height="14"
        rx="7"
        transform="rotate(45 50 50)"
        fill="url(#crossGrad)"
      />
      {/* Diagonal 2 */}
      <rect
        x="24"
        y="43"
        width="52"
        height="14"
        rx="7"
        transform="rotate(-45 50 50)"
        fill="url(#crossGrad)"
      />
      {/* Center Shine */}
      <circle cx="50" cy="50" r="4" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}





