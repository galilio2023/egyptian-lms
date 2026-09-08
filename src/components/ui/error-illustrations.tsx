import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
}

/**
 * 1. Friendly Mascot Repair / Fixer Illustration (For General & Student Errors)
 * Mascot with friendly wrench, glowing fix-it sparks, and cheerful reassuring vibe.
 */
export function MascotFixerErrorSvg({ className = "w-56 h-56", size }: SvgProps) {
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
        <radialGradient id="errGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
      </defs>

      {/* Ambient soft glow */}
      <circle cx="160" cy="140" r="120" fill="url(#errGlow)" />

      {/* Background Rotating Gears */}
      <g transform="translate(60, 60)" opacity="0.4">
        <circle cx="25" cy="25" r="18" fill="none" stroke="url(#gearGrad)" strokeWidth="6" strokeDasharray="8 6" />
        <circle cx="25" cy="25" r="7" fill="#94A3B8" />
      </g>
      <g transform="translate(220, 80)" opacity="0.4">
        <circle cx="20" cy="20" r="14" fill="none" stroke="url(#gearGrad)" strokeWidth="5" strokeDasharray="6 5" />
        <circle cx="20" cy="20" r="5" fill="#94A3B8" />
      </g>

      {/* Friendly Robot / Mascot Head */}
      <g transform="translate(110, 65)">
        {/* Antenna with warning lightbulb */}
        <line x1="50" y1="20" x2="50" y2="4" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="0" r="10" fill="url(#bulbGrad)" stroke="#CA8A04" strokeWidth="2" />
        <path d="M44 -10 L42 -14 M50 -12 L50 -16 M56 -10 L58 -14" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />

        {/* Head Box with rounded corners */}
        <rect x="10" y="20" width="80" height="70" rx="22" fill="#F8FAFC" stroke="#64748B" strokeWidth="3.5" />
        {/* Cute Ears */}
        <rect x="2" y="42" width="8" height="24" rx="4" fill="#94A3B8" />
        <rect x="90" y="42" width="8" height="24" rx="4" fill="#94A3B8" />

        {/* Screen Face */}
        <rect x="20" y="32" width="60" height="46" rx="14" fill="#1E293B" />

        {/* Friendly reassuring eyes (Blinking / smiling curved arc) */}
        <path d="M30 52 Q37 45 44 52" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M56 52 Q63 45 70 52" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Cheerful mouth */}
        <path d="M43 65 Q50 71 57 65" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Body */}
        <path d="M22 92 C22 88 32 86 50 86 C68 86 78 88 78 92 V130 H22 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
        {/* Heart / Power Gauge */}
        <circle cx="50" cy="110" r="10" fill="#F43F5E" />
        <path d="M46 110 L48 107 L51 113 L54 110" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Giant Golden Fix-it Wrench */}
      <g transform="translate(195, 140) rotate(28)">
        <rect x="10" y="0" width="14" height="75" rx="5" fill="url(#wrenchGrad)" stroke="#B45309" strokeWidth="2" />
        {/* Wrench Jaw Head */}
        <path
          d="M0 -8 C0 -20 12 -28 26 -28 C34 -28 42 -22 46 -15 L32 -6 C30 -10 26 -12 22 -12 C16 -12 11 -8 11 -1 L28 4 L23 15 L0 8 Z"
          fill="url(#wrenchGrad)"
          stroke="#B45309"
          strokeWidth="2"
        />
        {/* Grip Rings */}
        <line x1="12" y1="35" x2="22" y2="35" stroke="#B45309" strokeWidth="2" />
        <line x1="12" y1="45" x2="22" y2="45" stroke="#B45309" strokeWidth="2" />
      </g>

      {/* Sparks and Starlets */}
      <path d="M90 190L92 195L97 197L92 199L90 204L88 199L83 197L88 195Z" fill="#FDE047" />
      <path d="M250 170L251 174L255 175L251 176L250 180L249 176L245 175L249 174Z" fill="#F59E0B" />
      <path d="M60 130L61 133L64 134L61 135L60 138L59 135L56 134L59 133Z" fill="#38BDF8" />
    </svg>
  );
}

/**
 * 2. Administrative Shield & Alert Illustration
 * Technical radar blueprint with security shield, alert signal, and recovery gears.
 */
export function AdminShieldErrorSvg({ className = "w-56 h-56", size }: SvgProps) {
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
        <radialGradient id="adminErrGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E11D48" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="140" r="110" fill="url(#adminErrGlow)" stroke="#FDA4AF" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Main Alert Shield */}
      <g transform="translate(115, 60)">
        <path
          d="M45 10 L80 25 C80 65 65 95 45 110 C25 95 10 65 10 25 Z"
          fill="url(#alertGrad)"
          stroke="#FFE4E6"
          strokeWidth="3"
        />
        {/* Warning Exclamation Mark */}
        <rect x="42" y="38" width="6" height="32" rx="3" fill="#FFFFFF" />
        <circle cx="45" cy="82" r="4.5" fill="#FFFFFF" />
      </g>

      {/* Diagnostic Rings */}
      <circle cx="80" cy="190" r="18" stroke="#94A3B8" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="240" cy="90" r="14" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="4 4" />
    </svg>
  );
}
