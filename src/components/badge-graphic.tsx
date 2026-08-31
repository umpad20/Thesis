"use client";

import React from "react";
import { Lock, Check } from "lucide-react";
import type { BadgeType, MedalType } from "@/lib/types";

export interface BadgeGraphicProps {
  type?: BadgeType;
  medalType?: MedalType;
  badgeIconUrl?: string | null;
  status?: "locked" | "in_progress" | "completed";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatusBadge?: boolean;
}

const sizeMap = {
  xs: { box: "w-7 h-7", iconSize: 28 },
  sm: { box: "w-10 h-10", iconSize: 40 },
  md: { box: "w-14 h-14", iconSize: 56 },
  lg: { box: "w-20 h-20", iconSize: 80 },
  xl: { box: "w-28 h-28", iconSize: 112 },
};

export function BadgeGraphic({
  type = "star",
  medalType,
  badgeIconUrl,
  status = "completed",
  size = "md",
  className = "",
  showStatusBadge = false,
}: BadgeGraphicProps) {
  const { box } = sizeMap[size] || sizeMap.md;
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";

  // Check if custom badge icon or image is provided (excluding legacy core /badges/ path)
  const isCustomIcon = Boolean(badgeIconUrl) && !badgeIconUrl?.startsWith("/badges/");
  if (isCustomIcon && badgeIconUrl) {
    const isEmoji = badgeIconUrl.startsWith("emoji:");
    const emojiChar = isEmoji ? badgeIconUrl.replace("emoji:", "") : null;

    return (
      <div className={`relative inline-flex items-center justify-center select-none ${box} ${className}`}>
        <div
          className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
            isLocked ? "grayscale opacity-50 contrast-75" : isInProgress ? "filter drop-shadow-sm" : "filter drop-shadow-md"
          }`}
        >
          {isEmoji ? (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-indigo-100 border-2 border-amber-300 flex items-center justify-center shadow-xs">
              <span className="text-3xl sm:text-4xl">{emojiChar}</span>
            </div>
          ) : (
            <img
              src={badgeIconUrl}
              alt="Custom Badge"
              className="w-full h-full object-contain rounded-2xl border-2 border-amber-300/80 bg-white/90 p-1 shadow-sm"
            />
          )}
        </div>

        {showStatusBadge && (
          <div className="absolute -bottom-1 -right-1 z-10">
            {isLocked ? (
              <div className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                <Lock className="w-3 h-3" />
              </div>
            ) : isCompleted ? (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Determine badge category key for standard vector graphics
  const badgeKey =
    type === "medal"
      ? medalType === "bronze"
        ? "medal-bronze"
        : medalType === "silver"
        ? "medal-silver"
        : "medal-gold"
      : type === "ribbon"
      ? "ribbon"
      : "star";

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${box} ${className}`}>
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
          isLocked ? "grayscale opacity-50 contrast-75" : isInProgress ? "filter drop-shadow-sm" : "filter drop-shadow-md"
        }`}
      >
        {/* Star Badge Graphic */}
        {badgeKey === "star" && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Outer Golden Gradient */}
              <linearGradient id="starOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="45%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              {/* Star Bevel Gradient */}
              <linearGradient id="starInner" x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="60%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              {/* Base Circle Gradient */}
              <radialGradient id="starCircle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="70%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </radialGradient>
              <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#CA8A04" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Circular Base Backplate */}
            <circle cx="50" cy="50" r="44" fill="url(#starCircle)" stroke="#F59E0B" strokeWidth="3" filter="url(#starGlow)" />
            <circle cx="50" cy="50" r="39" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Starburst Rays */}
            <g opacity="0.6" stroke="#F59E0B" strokeWidth="1.5">
              <line x1="50" y1="8" x2="50" y2="14" />
              <line x1="50" y1="86" x2="50" y2="92" />
              <line x1="8" y1="50" x2="14" y2="50" />
              <line x1="86" y1="50" x2="92" y2="50" />
            </g>

            {/* 5-Point Star with Beveled Facets */}
            {/* Base 5-Point Star */}
            <polygon
              points="50,15 60.5,36.5 84,40 67,56.5 71,80 50,69 29,80 33,56.5 16,40 39.5,36.5"
              fill="url(#starOuter)"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Star Highlight Facets (Left Sides) */}
            <polygon points="50,15 50,52 60.5,36.5" fill="#FEF08A" opacity="0.8" />
            <polygon points="84,40 50,52 67,56.5" fill="#FEF08A" opacity="0.8" />
            <polygon points="71,80 50,52 50,69" fill="#FEF08A" opacity="0.8" />
            <polygon points="29,80 50,52 33,56.5" fill="#FEF08A" opacity="0.8" />
            <polygon points="16,40 50,52 39.5,36.5" fill="#FEF08A" opacity="0.8" />

            {/* Star Shading Facets (Right Sides) */}
            <polygon points="50,15 50,52 39.5,36.5" fill="#B45309" opacity="0.25" />
            <polygon points="16,40 50,52 33,56.5" fill="#B45309" opacity="0.25" />
            <polygon points="29,80 50,52 50,69" fill="#B45309" opacity="0.25" />
            <polygon points="71,80 50,52 67,56.5" fill="#B45309" opacity="0.25" />
            <polygon points="84,40 50,52 60.5,36.5" fill="#B45309" opacity="0.25" />

            {/* Inner Center Star Glyphs */}
            <circle cx="50" cy="50" r="10" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
            <polygon points="50,43 52.5,48 58,48.8 54,52.7 55,58 50,55.4 45,58 46,52.7 42,48.8 47.5,48" fill="#F59E0B" />

            {/* Sparkle Glint Top-Right */}
            <circle cx="70" cy="25" r="2.5" fill="#FFFFFF" opacity="0.9" />
            <line x1="70" y1="20" x2="70" y2="30" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="65" y1="25" x2="75" y2="25" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}

        {/* Ribbon Badge Graphic */}
        {badgeKey === "ribbon" && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Ribbon Tail Linear Gradient */}
              <linearGradient id="ribbonTailBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="ribbonTailDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
              {/* Rosette Rim Gradient */}
              <radialGradient id="rosetteRim" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </radialGradient>
              {/* Inner Medallion Gradient */}
              <linearGradient id="rosetteInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
            </defs>

            {/* Left Hanging Ribbon Tail */}
            <polygon points="34,48 20,88 34,78 44,88 40,48" fill="url(#ribbonTailBlue)" stroke="#1E3A8A" strokeWidth="1.5" />
            <polygon points="34,48 27,88 34,78 37,88 40,48" fill="url(#ribbonTailDark)" opacity="0.3" />

            {/* Right Hanging Ribbon Tail */}
            <polygon points="60,48 56,88 66,78 80,88 66,48" fill="url(#ribbonTailBlue)" stroke="#1E3A8A" strokeWidth="1.5" />
            <polygon points="60,48 63,88 66,78 73,88 66,48" fill="url(#ribbonTailDark)" opacity="0.3" />

            {/* Rosette Pleated Scalloped Outer Edge */}
            <circle cx="50" cy="40" r="32" fill="url(#rosetteRim)" stroke="#1E40AF" strokeWidth="2.5" />

            {/* Pleat petals decoration (12 outer points) */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <circle
                key={deg}
                cx={50 + 29 * Math.cos((deg * Math.PI) / 180)}
                cy={40 + 29 * Math.sin((deg * Math.PI) / 180)}
                r="4.5"
                fill="#3B82F6"
                stroke="#1D4ED8"
                strokeWidth="1"
              />
            ))}

            {/* Gold Central Medallion */}
            <circle cx="50" cy="40" r="22" fill="url(#rosetteInner)" stroke="#CA8A04" strokeWidth="2" />
            <circle cx="50" cy="40" r="18" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="2 2" />

            {/* Open Book / Reading Laurel Motif in Ribbon Center */}
            <g transform="translate(50, 40) scale(0.7) translate(-24, -24)" fill="none" stroke="#854D0E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#FFFBEB" />
              <path d="M28 19.5A2.5 2.5 0 0 0 25.5 17H12" />
              <path d="M25.5 2H12v20h13.5A2.5 2.5 0 0 0 28 19.5v-15A2.5 2.5 0 0 0 25.5 2z" fill="#FFFBEB" />
            </g>
          </svg>
        )}

        {/* Bronze Medal Badge Graphic */}
        {badgeKey === "medal-bronze" && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bronzeRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991B1B" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
              <radialGradient id="bronzeMedalGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FDBA74" />
                <stop offset="35%" stopColor="#D97706" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </radialGradient>
              <linearGradient id="bronzeRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="50%" stopColor="#C2410C" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
            </defs>

            {/* Neck Ribbon Loop at Top */}
            <polygon points="36,6 50,30 64,6" fill="url(#bronzeRibbon)" stroke="#7F1D1D" strokeWidth="1.5" />
            <polygon points="44,6 50,30 56,6" fill="#F87171" opacity="0.6" />

            {/* Bronze Medal Body */}
            <circle cx="50" cy="56" r="36" fill="url(#bronzeMedalGrad)" stroke="url(#bronzeRim)" strokeWidth="3.5" />
            <circle cx="50" cy="56" r="30" stroke="#78350F" strokeWidth="1.5" opacity="0.6" />
            <circle cx="50" cy="56" r="28" stroke="#FED7AA" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />

            {/* Laurel Wreath Engraving */}
            <path
              d="M32,56 C32,45 40,36 50,36 C60,36 68,45 68,56 C68,67 60,74 50,74 C40,74 32,67 32,56 Z"
              stroke="#78350F"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />

            {/* Inner Bronze Star & 'B' Emblem */}
            <polygon
              points="50,41 53,49 61,50 55,56 57,64 50,60 43,64 45,56 39,50 47,49"
              fill="#FFF7ED"
              stroke="#9A3412"
              strokeWidth="1.5"
            />
            <text x="50" y="58" textAnchor="middle" fill="#9A3412" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              3
            </text>
          </svg>
        )}

        {/* Silver Medal Badge Graphic */}
        {badgeKey === "medal-silver" && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="silverRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
              <radialGradient id="silverMedalGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#F1F5F9" />
                <stop offset="65%" stopColor="#CBD5E1" />
                <stop offset="85%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </radialGradient>
              <linearGradient id="silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            {/* Neck Ribbon Loop at Top */}
            <polygon points="36,6 50,30 64,6" fill="url(#silverRibbon)" stroke="#1E3A8A" strokeWidth="1.5" />
            <polygon points="44,6 50,30 56,6" fill="#60A5FA" opacity="0.7" />

            {/* Silver Medal Body */}
            <circle cx="50" cy="56" r="36" fill="url(#silverMedalGrad)" stroke="url(#silverRim)" strokeWidth="3.5" />
            <circle cx="50" cy="56" r="30" stroke="#475569" strokeWidth="1.5" opacity="0.6" />
            <circle cx="50" cy="56" r="28" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" opacity="0.9" />

            {/* Laurel Wreath Engraving */}
            <path
              d="M32,56 C32,45 40,36 50,36 C60,36 68,45 68,56 C68,67 60,74 50,74 C40,74 32,67 32,56 Z"
              stroke="#475569"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />

            {/* Inner Silver Star & '2' Emblem */}
            <polygon
              points="50,41 53,49 61,50 55,56 57,64 50,60 43,64 45,56 39,50 47,49"
              fill="#FFFFFF"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="50" y="58" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              2
            </text>

            {/* Metallic Sheen Flare */}
            <ellipse cx="40" cy="44" rx="8" ry="4" transform="rotate(-30 40 44)" fill="#FFFFFF" opacity="0.6" />
          </svg>
        )}

        {/* Gold Medal Badge Graphic */}
        {badgeKey === "medal-gold" && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065F46" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>
              <radialGradient id="goldMedalGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FEF9C3" />
                <stop offset="25%" stopColor="#FDE047" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="85%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#854D0E" />
              </radialGradient>
              <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#713F12" />
              </linearGradient>
              <filter id="goldRadiance" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#CA8A04" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Neck Ribbon Loop at Top (Championship Green & Gold) */}
            <polygon points="36,6 50,30 64,6" fill="url(#goldRibbon)" stroke="#064E3B" strokeWidth="1.5" />
            <polygon points="44,6 50,30 56,6" fill="#FACC15" opacity="0.8" />

            {/* Gold Medal Body with Radiance */}
            <circle cx="50" cy="56" r="36" fill="url(#goldMedalGrad)" stroke="url(#goldRim)" strokeWidth="3.5" filter="url(#goldRadiance)" />
            <circle cx="50" cy="56" r="30" stroke="#854D0E" strokeWidth="1.5" opacity="0.6" />
            <circle cx="50" cy="56" r="28" stroke="#FEF9C3" strokeWidth="1" strokeDasharray="2 2" opacity="0.9" />

            {/* Radiant Sunburst Rays Behind Center Emblem */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1={50 + 20 * Math.cos((deg * Math.PI) / 180)}
                y1={56 + 20 * Math.sin((deg * Math.PI) / 180)}
                x2={50 + 26 * Math.cos((deg * Math.PI) / 180)}
                y2={56 + 26 * Math.sin((deg * Math.PI) / 180)}
                stroke="#FEF08A"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            ))}

            {/* Laurel Wreath Engraving */}
            <path
              d="M32,56 C32,45 40,36 50,36 C60,36 68,45 68,56 C68,67 60,74 50,74 C40,74 32,67 32,56 Z"
              stroke="#854D0E"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />

            {/* Inner Champion Star & '1' Emblem */}
            <polygon
              points="50,41 53,49 61,50 55,56 57,64 50,60 43,64 45,56 39,50 47,49"
              fill="#FFFBEB"
              stroke="#713F12"
              strokeWidth="1.5"
            />
            <text x="50" y="58" textAnchor="middle" fill="#713F12" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              1
            </text>

            {/* Gold Sparkle Flare */}
            <circle cx="68" cy="40" r="2.5" fill="#FFFFFF" opacity="0.95" />
            <line x1="68" y1="36" x2="68" y2="44" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <line x1="64" y1="40" x2="72" y2="40" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Status Overlays */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-900/80 backdrop-blur-xs flex items-center justify-center text-white shadow-md border border-slate-700/50">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {showStatusBadge && isCompleted && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {showStatusBadge && isInProgress && (
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow-md border border-white tracking-tighter">
          Active
        </div>
      )}
    </div>
  );
}

/**
 * Helper to get a human-friendly category label
 */
export function getBadgeCategoryLabel(type: BadgeType, medalType?: MedalType): string {
  if (type === "star") return "Star Badge";
  if (type === "ribbon") return "Ribbon Badge";
  if (type === "medal") {
    if (medalType === "bronze") return "Bronze Medal Badge";
    if (medalType === "silver") return "Silver Medal Badge";
    if (medalType === "gold") return "Gold Medal Badge";
    return "Medal Badge";
  }
  return "Badge";
}
