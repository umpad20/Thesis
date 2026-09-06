"use client";

import React from "react";
import { Lock, Sparkles, Check } from "lucide-react";
import type { BadgeType, MedalType } from "@/lib/types";

export interface StorybookSealProps {
  stageNumber: number;
  name: string;
  type?: BadgeType;
  medalType?: MedalType;
  badgeIconUrl?: string | null;
  status: "locked" | "in_progress" | "completed";
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

const UNIFIED_BADGE_ASSETS: Record<number, string> = {
  1: "/images/badges/badge_stage_1_star.png",
  2: "/images/badges/badge_stage_2_ribbon.png",
  3: "/images/badges/badge_stage_3_bronze.png",
  4: "/images/badges/badge_stage_4_silver.png",
  5: "/images/badges/badge_stage_5_gold.png",
};

const SHORT_STAGE_NAMES: Record<number, string> = {
  1: "Star",
  2: "Ribbon",
  3: "Bronze",
  4: "Silver",
  5: "Gold",
};

function getBadgeAsset(
  stageNumber: number,
  type?: BadgeType,
  medalType?: MedalType,
  badgeIconUrl?: string | null
): string {
  if (badgeIconUrl && badgeIconUrl.startsWith("/images/badges/")) {
    return badgeIconUrl;
  }
  if (stageNumber in UNIFIED_BADGE_ASSETS) {
    return UNIFIED_BADGE_ASSETS[stageNumber];
  }
  if (type === "medal") {
    if (medalType === "bronze") return "/images/badges/badge_stage_3_bronze.png";
    if (medalType === "silver") return "/images/badges/badge_stage_4_silver.png";
    return "/images/badges/badge_stage_5_gold.png";
  }
  if (type === "ribbon") return "/images/badges/badge_stage_2_ribbon.png";
  return "/images/badges/badge_stage_1_star.png";
}

export function StorybookSeal({
  stageNumber,
  name,
  type = "star",
  medalType,
  badgeIconUrl,
  status,
  isSelected,
  onClick,
  className = "",
}: StorybookSealProps) {
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";

  const isCoreBadge = stageNumber <= 5;
  const isEmoji = Boolean(badgeIconUrl?.startsWith("emoji:"));
  const emojiChar = isEmoji ? badgeIconUrl?.replace("emoji:", "") : null;
  const isCustomImage =
    !isCoreBadge &&
    Boolean(badgeIconUrl) &&
    !badgeIconUrl?.startsWith("/badges/") &&
    !badgeIconUrl?.startsWith("/images/badges/") &&
    !isEmoji;

  const badgeSrc = getBadgeAsset(stageNumber, type, medalType, badgeIconUrl);
  const shortName = SHORT_STAGE_NAMES[stageNumber] || `Stage ${stageNumber}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 w-full max-w-[76px] sm:max-w-[105px] ${className} ${
        isSelected ? "scale-105 z-10" : "hover:scale-102 opacity-90 hover:opacity-100"
      }`}
    >
      {/* Active Bookmark Ribbon Indicator */}
      <div
        className={`w-7 h-2 sm:w-10 sm:h-2.5 md:w-12 md:h-3 -mb-1 rounded-t-sm transition-all duration-300 ${
          isSelected
            ? "bg-gradient-to-b from-blue-600 to-blue-500 shadow-xs"
            : isCompleted
            ? "bg-gradient-to-b from-amber-400/80 to-amber-500"
            : "bg-slate-300/50"
        }`}
      />

      {/* Main Seal Container with Responsive Sizing */}
      <div
        className={`relative w-12 h-12 xs:w-13 xs:h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl sm:rounded-2xl transition-all duration-300 p-0.5 flex items-center justify-center ${
          isSelected
            ? "ring-2 sm:ring-4 ring-blue-500 ring-offset-1 sm:ring-offset-2 ring-offset-amber-50 shadow-md"
            : "shadow-xs"
        }`}
      >
        <div
          className={`w-full h-full rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
            isLocked
              ? "grayscale opacity-45 contrast-75 bg-slate-200"
              : isInProgress
              ? "filter drop-shadow-sm"
              : "filter drop-shadow-md"
          }`}
        >
          {isEmoji ? (
            <div className="w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-100 to-indigo-100 flex items-center justify-center">
              <span className="text-xl sm:text-3xl">{emojiChar}</span>
            </div>
          ) : isCustomImage && badgeIconUrl ? (
            <img
              src={badgeIconUrl}
              alt={name}
              className="w-full h-full object-contain rounded-lg sm:rounded-xl bg-white/90 p-0.5"
            />
          ) : (
            <img
              src={badgeSrc}
              alt={name}
              className="w-full h-full object-contain rounded-lg sm:rounded-xl"
              loading="eager"
            />
          )}
        </div>

        {/* Lock Overlay on Inactive Stages */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-white shadow-md border border-slate-700/60">
              <Lock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
        )}

        {/* Mastered Checkmark Badge */}
        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-1.5 sm:border-2 border-white shadow-xs">
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </div>
        )}

        {/* Active Stage Indicator */}
        {isInProgress && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white flex items-center justify-center border-1.5 sm:border-2 border-white shadow-xs animate-pulse">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
        )}
      </div>

      {/* Seal Title & Status */}
      <div className="text-center mt-1 sm:mt-1.5 w-full max-w-[62px] xs:max-w-[70px] sm:max-w-[90px] md:max-w-[105px]">
        <span
          title={name}
          className={`text-[9px] xs:text-[10px] sm:text-xs font-bold block leading-tight truncate ${
            isSelected ? "text-blue-900 font-extrabold" : "text-slate-800"
          }`}
        >
          <span className="hidden sm:inline">{name}</span>
          <span className="sm:hidden">{shortName}</span>
        </span>
        <span
          className={`text-[8px] xs:text-[9px] sm:text-[10px] font-semibold block leading-tight mt-0.5 ${
            isCompleted
              ? "text-emerald-700 font-bold"
              : isInProgress
              ? "text-blue-600 font-bold"
              : "text-slate-400"
          }`}
        >
          {isCompleted ? (
            <>
              <span className="hidden sm:inline">✨ Unlocked</span>
              <span className="sm:hidden">Unlocked</span>
            </>
          ) : isInProgress ? (
            <>
              <span className="hidden sm:inline">Active Stage</span>
              <span className="sm:hidden">Active</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">🔒 Locked</span>
              <span className="sm:hidden">Locked</span>
            </>
          )}
        </span>
      </div>
    </button>
  );
}
