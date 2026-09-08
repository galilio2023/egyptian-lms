import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
}

/**
 * 1. Global 404 Illustration: Lost Mascot Explorer in Space
 * Multi-layered 3D vector illustration with ringed nebula planet, friendly space explorer,
 * glowing stars, satellite probe, and neon '404' badge.
 */
export function SpaceExplorer404Svg({ className = "w-64 h-64", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Deep Nebula Gradient */}
        <radialGradient id="spaceNebula" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="40%" stopColor="#6366F1" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>

        {/* Planet Gradient */}
        <linearGradient id="planetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="45%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>

        {/* Planet Ring Gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#F472B6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
        </linearGradient>

        {/* Astronaut Suit Gradient */}
        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Visor Gradient (Glossy Gold/Amber Mirror) */}
        <linearGradient id="visorGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Soft Drop Glow */}
        <filter id="glow404" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#8B5CF6" floodOpacity="0.35" />
        </filter>
        <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FDE047" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* 1. Background Nebula Aura */}
      <circle cx="200" cy="160" r="150" fill="url(#spaceNebula)" />

      {/* 2. Twinkling Golden Stars & Sparkles */}
      <g filter="url(#starGlow)">
        {/* Star 1 - Top Left */}
        <path d="M60 50L63 60L73 63L63 66L60 76L57 66L47 63L57 60Z" fill="#FDE047" />
        {/* Star 2 - Top Right */}
        <path d="M340 70L342 78L350 80L342 82L340 90L338 82L330 80L338 78Z" fill="#FDE047" />
        {/* Star 3 - Bottom Left */}
        <path d="M70 240L72 246L78 248L72 250L70 256L68 250L62 248L68 246Z" fill="#FBBF24" />
        {/* Star 4 - Mid Right */}
        <path d="M330 210L332 217L339 219L332 221L330 228L328 221L321 219L328 217Z" fill="#FDE047" />
      </g>
      {/* Tiny star dots */}
      <circle cx="120" cy="40" r="2" fill="#E2E8F0" opacity="0.8" />
      <circle cx="280" cy="35" r="2.5" fill="#E2E8F0" opacity="0.8" />
      <circle cx="360" cy="140" r="1.5" fill="#E2E8F0" opacity="0.6" />
      <circle cx="45" cy="130" r="2" fill="#E2E8F0" opacity="0.7" />
      <circle cx="150" cy="280" r="2" fill="#E2E8F0" opacity="0.8" />
      <circle cx="290" cy="270" r="2.5" fill="#E2E8F0" opacity="0.8" />

      {/* 3. Orbiting Ringed Planet (Background Layer) */}
      <g transform="translate(40, 60)">
        {/* Back half of ring */}
        <ellipse
          cx="60"
          cy="60"
          rx="52"
          ry="14"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          transform="rotate(-22 60 60)"
          strokeDasharray="90 140"
          strokeDashoffset="110"
        />
        {/* Planet Sphere */}
        <circle cx="60" cy="60" r="32" fill="url(#planetGrad)" filter="url(#glow404)" />
        {/* Planet Surface Shadow / Texture Band */}
        <path
          d="M38 48C45 52 58 52 70 48C78 45 84 46 88 50C85 64 74 76 60 76C46 76 34 65 32 50C34 49 36 48 38 48Z"
          fill="#3B0764"
          opacity="0.35"
        />
        {/* Front half of ring */}
        <ellipse
          cx="60"
          cy="60"
          rx="52"
          ry="14"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          transform="rotate(-22 60 60)"
          strokeDasharray="140 90"
        />
      </g>

      {/* 4. Cute Floating Astronaut Mascot (Center Hero) */}
      <g transform="translate(145, 65)" filter="url(#glow404)">
        {/* Oxygen Backpack Tank */}
        <rect x="22" y="55" width="66" height="70" rx="18" fill="#94A3B8" stroke="#64748B" strokeWidth="2.5" />
        <rect x="26" y="58" width="26" height="64" rx="12" fill="#CBD5E1" />
        <rect x="58" y="58" width="26" height="64" rx="12" fill="#E2E8F0" />
        <circle cx="39" cy="65" r="3" fill="#6366F1" />
        <circle cx="71" cy="65" r="3" fill="#EC4899" />

        {/* Floating Tether / Spiral Cable */}
        <path
          d="M22 100 C5 110 -15 130 -10 150 C-5 170 15 175 25 190 C35 205 30 220 20 230"
          stroke="#A855F7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.75"
        />

        {/* Astronaut Body / Torso */}
        <path
          d="M34 76 C34 68 44 64 55 64 C66 64 76 68 76 76 V115 C76 120 72 125 67 125 H43 C38 125 34 120 34 115 Z"
          fill="url(#suitGrad)"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        {/* Chest Console & Badge */}
        <rect x="45" y="78" width="20" height="15" rx="4" fill="#334155" />
        <circle cx="50" cy="85.5" r="2.5" fill="#38BDF8" />
        <circle cx="60" cy="85.5" r="2.5" fill="#34D399" />

        {/* Legs with space boots */}
        <g>
          {/* Left leg */}
          <path d="M42 122 L38 152 C38 156 34 160 28 160 H24 C20 160 17 156 19 152 L26 122 Z" fill="url(#suitGrad)" stroke="#94A3B8" strokeWidth="2" />
          <rect x="18" y="152" width="18" height="10" rx="4" fill="#64748B" />
          {/* Right leg */}
          <path d="M68 122 L72 152 C72 156 76 160 82 160 H86 C90 160 93 156 91 152 L84 122 Z" fill="url(#suitGrad)" stroke="#94A3B8" strokeWidth="2" />
          <rect x="74" y="152" width="18" height="10" rx="4" fill="#64748B" />
        </g>

        {/* Arms waving / holding magnifying glass */}
        {/* Left Arm waving hello */}
        <path
          d="M36 78 C25 78 12 70 8 58 C6 52 12 48 16 52 C20 56 26 70 34 74"
          fill="url(#suitGrad)"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <circle cx="10" cy="52" r="7" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

        {/* Right Arm holding space telescope */}
        <path
          d="M74 78 C85 80 96 86 102 96 C105 101 100 106 95 103 C90 99 82 90 74 85"
          fill="url(#suitGrad)"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <circle cx="101" cy="99" r="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

        {/* Floating Magnifying Glass searching for page */}
        <g transform="translate(96, 76) rotate(-25)">
          <circle cx="16" cy="16" r="13" fill="#E0F2FE" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="3" />
          <path d="M26 26 L38 38" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          {/* Lens reflection glint */}
          <path d="M9 13 C10 9 14 7 19 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="21" cy="20" r="1.5" fill="#38BDF8" />
        </g>

        {/* Big Rounded Helmet */}
        <circle cx="55" cy="44" r="32" fill="url(#suitGrad)" stroke="#94A3B8" strokeWidth="2.5" />
        {/* Cute Ear Antennas with Pink Bobble */}
        <path d="M55 12 V2" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="55" cy="2" r="4" fill="#EC4899" />

        {/* Glossy Visor (Golden Amber Reflection) */}
        <rect x="33" y="27" width="44" height="32" rx="14" fill="url(#visorGrad)" stroke="#78350F" strokeWidth="1.5" />
        {/* Visor Glare & Smiley Wink */}
        <path
          d="M38 34 C43 31 50 30 58 31"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="68" cy="35" r="2" fill="#FFFFFF" opacity="0.9" />
        {/* Friendly cute face silhouette under visor */}
        <circle cx="48" cy="43" r="2.5" fill="#78350F" />
        <circle cx="62" cy="43" r="2.5" fill="#78350F" />
        <path d="M51 48 C53 51 57 51 59 48" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 5. Floating Cute Satellite Explorer (Right Side) */}
      <g transform="translate(285, 120)">
        {/* Solar Panels */}
        <rect x="0" y="16" width="22" height="12" rx="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1.5" />
        <line x1="11" y1="16" x2="11" y2="28" stroke="#60A5FA" strokeWidth="1" />
        <rect x="42" y="16" width="22" height="12" rx="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1.5" />
        <line x1="53" y1="16" x2="53" y2="28" stroke="#60A5FA" strokeWidth="1" />
        {/* Satellite Core Cube */}
        <rect x="22" y="12" width="20" height="20" rx="5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="32" cy="22" r="5" fill="#F59E0B" />
        {/* Antenna with signal arches */}
        <line x1="32" y1="12" x2="32" y2="3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="3" r="2.5" fill="#EF4444" />
        <path d="M26 -1 C29 -4 35 -4 38 -1" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M22 -5 C28 -10 36 -10 42 -5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      </g>

      {/* 6. Giant 3D '404' Badge (Floating in Center Forefront) */}
      <g transform="translate(100, 240)">
        <rect
          x="0"
          y="0"
          width="200"
          height="54"
          rx="27"
          fill="#1E1B4B"
          fillOpacity="0.85"
          stroke="url(#ringGrad)"
          strokeWidth="3"
          filter="url(#glow404)"
        />
        {/* Inner Highlight line */}
        <path d="M24 8 H176" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        {/* 404 Text in bold cheerful rounded typography */}
        <text
          x="100"
          y="38"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#FFFFFF"
          letterSpacing="4"
        >
          4<tspan fill="#FDE047">0</tspan>4
        </text>
      </g>
    </svg>
  );
}

/**
 * 2. Portal Student 404: Treasure Island Explorer Lion
 * Cheerful lion mascot with explorer safari hat, upside-down treasure map,
 * and overflowing XP gems chest.
 */
export function StudentPortal404Svg({ className = "w-56 h-56", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="portalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="maneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="furGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="chestWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Backdrop Halo */}
      <circle cx="160" cy="140" r="110" fill="url(#portalGrad)" />

      {/* Floating Island Base with grass and sand */}
      <path
        d="M40 210 C70 195 130 190 160 190 C190 190 250 195 280 210 C250 235 190 245 160 245 C130 245 70 235 40 210 Z"
        fill="#FDE68A"
        stroke="#D97706"
        strokeWidth="3"
      />
      <path
        d="M60 205 C100 196 140 194 160 194 C180 194 220 196 260 205 C240 215 180 220 160 220 C140 220 80 215 60 205 Z"
        fill="#34D399"
      />

      {/* Explorer Lion Mascot */}
      <g transform="translate(105, 55)">
        {/* Mane Petals */}
        <circle cx="55" cy="55" r="46" fill="url(#maneGrad)" />
        {/* Safari Hat */}
        <ellipse cx="55" cy="18" rx="34" ry="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        <path d="M35 18 C35 6 44 2 55 2 C66 2 75 6 75 18 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
        <rect x="35" y="14" width="40" height="4" fill="#3B82F6" />

        {/* Lion Face */}
        <circle cx="55" cy="58" r="34" fill="url(#furGrad)" />
        {/* Muzzle */}
        <ellipse cx="55" cy="68" rx="18" ry="13" fill="#FFFBEB" />
        <path d="M50 63 L60 63 L55 69 Z" fill="#78350F" />
        <path d="M55 69 V74" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        <path d="M51 74 C53 76 57 76 59 74" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />

        {/* Wondering Eyes */}
        <ellipse cx="44" cy="52" rx="4.5" ry="6" fill="#1E293B" />
        <circle cx="45.5" cy="50" r="1.8" fill="#FFFFFF" />
        <ellipse cx="66" cy="52" rx="4.5" ry="6" fill="#1E293B" />
        <circle cx="67.5" cy="50" r="1.8" fill="#FFFFFF" />

        {/* Cheerful rosy cheeks */}
        <circle cx="36" cy="64" r="5" fill="#F472B6" opacity="0.6" />
        <circle cx="74" cy="64" r="5" fill="#F472B6" opacity="0.6" />

        {/* Ears */}
        <circle cx="26" cy="30" r="10" fill="url(#maneGrad)" />
        <circle cx="26" cy="30" r="6" fill="#FDE68A" />
        <circle cx="84" cy="30" r="10" fill="url(#maneGrad)" />
        <circle cx="84" cy="30" r="6" fill="#FDE68A" />

        {/* Lion Torso */}
        <path d="M35 90 C35 84 44 82 55 82 C66 82 75 84 75 90 V115 H35 Z" fill="#F59E0B" />
        <path d="M43 90 C43 85 49 84 55 84 C61 84 67 85 67 90 V115 H43 Z" fill="#FFFBEB" />
      </g>

      {/* Explorer Map with Red 'X' and dotted line */}
      <g transform="translate(60, 140) rotate(-12)">
        <rect x="0" y="0" width="70" height="50" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
        <path d="M12 12 Q30 35 50 18" stroke="#B45309" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        {/* Red X marks the lost spot */}
        <path d="M48 16 L56 24 M56 16 L48 24" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="#3B82F6" />
      </g>

      {/* Treasure Chest with XP Jewels */}
      <g transform="translate(180, 145)">
        {/* Chest body */}
        <rect x="0" y="16" width="56" height="36" rx="6" fill="url(#chestWood)" stroke="#451A03" strokeWidth="2" />
        {/* Gold metal trim */}
        <rect x="4" y="16" width="6" height="36" fill="#F59E0B" />
        <rect x="46" y="16" width="6" height="36" fill="#F59E0B" />
        {/* Keyhole */}
        <circle cx="28" cy="32" r="3" fill="#F59E0B" />
        <path d="M28 32 V38" stroke="#F59E0B" strokeWidth="2" />
        {/* Chest Lid tilted open */}
        <path d="M-2 16 C8 4 48 4 58 16 Z" fill="#B45309" stroke="#451A03" strokeWidth="2" />
        {/* Shining XP Gem spilling out */}
        <polygon points="28,2 36,10 28,18 20,10" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <polygon points="40,6 46,12 40,18 34,12" fill="#EC4899" stroke="#BE185D" strokeWidth="1.5" />
      </g>

      {/* Sparkles */}
      <path d="M50 80L52 86L58 88L52 90L50 96L48 90L42 88L48 86Z" fill="#FDE047" />
      <path d="M260 90L262 96L268 98L262 100L260 106L258 100L252 98L258 96Z" fill="#FDE047" />
    </svg>
  );
}

/**
 * 3. Admin 404: Administrative Radar & Shield Blueprint
 * High-tech purple/indigo aesthetic with crown shield, radar grid,
 * magnifying glass and directory blocks.
 */
export function AdminShield404Svg({ className = "w-56 h-56", size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="adminBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Blueprint Grid Circles */}
      <circle cx="160" cy="140" r="110" fill="url(#adminBg)" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="160" cy="140" r="75" stroke="#E0E7FF" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="50" y1="140" x2="270" y2="140" stroke="#E0E7FF" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="160" y1="30" x2="160" y2="250" stroke="#E0E7FF" strokeWidth="1" strokeDasharray="2 2" />

      {/* Central Royal Shield */}
      <g transform="translate(115, 60)">
        <path
          d="M45 10 L80 25 C80 65 65 95 45 110 C25 95 10 65 10 25 Z"
          fill="url(#shieldGrad)"
          stroke="#A5B4FC"
          strokeWidth="3"
        />
        {/* Inner Shield Bevel */}
        <path
          d="M45 20 L72 32 C72 65 58 90 45 100 C32 90 18 65 18 32 Z"
          fill="#4338CA"
          opacity="0.5"
        />
        {/* Golden Crown */}
        <path
          d="M26 65 L28 45 L36 53 L45 38 L54 53 L62 45 L64 65 Z"
          fill="url(#crownGrad)"
          stroke="#B45309"
          strokeWidth="1.5"
        />
        <circle cx="45" cy="38" r="3" fill="#FDE047" />
        <circle cx="28" cy="45" r="2.5" fill="#FDE047" />
        <circle cx="62" cy="45" r="2.5" fill="#FDE047" />

        {/* Keyhole / Security Pass */}
        <circle cx="45" cy="78" r="4" fill="#FFFFFF" />
        <path d="M43 82 L47 82 L48 90 L42 90 Z" fill="#FFFFFF" />
      </g>

      {/* Modern High-Tech Magnifying Scanner */}
      <g transform="translate(180, 120)">
        <circle cx="35" cy="35" r="28" fill="#FFFFFF" stroke="#6366F1" strokeWidth="4" />
        <circle cx="35" cy="35" r="20" fill="#EEF2FF" />
        {/* Handle */}
        <path d="M55 55 L82 82" stroke="#4F46E5" strokeWidth="7" strokeLinecap="round" />
        <path d="M55 55 L82 82" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
        {/* Glass Scan Line */}
        <line x1="22" y1="35" x2="48" y2="35" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
        <text x="35" y="40" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#6366F1" fontFamily="monospace">404</text>
      </g>

      {/* Floating System Cubes */}
      <rect x="55" y="90" width="22" height="22" rx="5" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="1.5" transform="rotate(15 55 90)" />
      <rect x="70" y="180" width="26" height="26" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(-10 70 180)" />
    </svg>
  );
}
