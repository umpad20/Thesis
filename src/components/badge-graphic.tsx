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

const UNIFIED_BADGE_ASSETS: Record<string, string> = {
  star: "/images/badges/badge_stage_1_star.png",
  ribbon: "/images/badges/badge_stage_2_ribbon.png",
  "medal-bronze": "/images/badges/badge_stage_3_bronze.png",
  "medal-silver": "/images/badges/badge_stage_4_silver.png",
  "medal-gold": "/images/badges/badge_stage_5_gold.png",
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

  // Check if custom badge icon or image is provided (excluding core system paths)
  const isCustomIcon =
    Boolean(badgeIconUrl) &&
    !badgeIconUrl?.startsWith("/badges/") &&
    !badgeIconUrl?.startsWith("/images/badges/");

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

  // Resolve unified badge image source
  let resolvedSrc = UNIFIED_BADGE_ASSETS[badgeKey] || UNIFIED_BADGE_ASSETS.star;
  if (badgeIconUrl && badgeIconUrl.startsWith("/images/badges/")) {
    resolvedSrc = badgeIconUrl;
  }

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${box} ${className}`}>
      <div
        className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
          isLocked
            ? "grayscale opacity-40 contrast-75"
            : isInProgress
            ? "filter drop-shadow-md scale-105 ring-2 ring-blue-500/50 rounded-2xl"
            : "filter drop-shadow-sm hover:scale-105"
        }`}
      >
        <img
          src={resolvedSrc}
          alt={getBadgeCategoryLabel(type, medalType)}
          className="w-full h-full object-contain rounded-2xl shadow-sm"
          loading="eager"
        />
      </div>

      {/* Status Overlays */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-slate-900/85 backdrop-blur-xs flex items-center justify-center text-white shadow-md border border-slate-700/60">
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
