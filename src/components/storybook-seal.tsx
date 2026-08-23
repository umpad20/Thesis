"use client";

import React from "react";
import { Lock, Sparkles, Check, Star, Award, Shield } from "lucide-react";
import type { BadgeType, MedalType } from "@/lib/types";

export interface StorybookSealProps {
  stageNumber: number;
  name: string;
  type: BadgeType;
  medalType?: MedalType;
  status: "locked" | "in_progress" | "completed";
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function StorybookSeal({
  stageNumber,
  name,
  type,
  medalType,
  status,
  isSelected,
  onClick,
  className = "",
}: StorybookSealProps) {
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";

  // Color profiles for the 5 seal tiers
  const getSealTheme = () => {
    if (type === "star") {
      return {
        bgGradient: "from-amber-300 via-amber-400 to-amber-600",
        border: "border-amber-200",
        shadow: "shadow-amber-500/25",
        text: "text-amber-950",
        glow: "rgba(245, 158, 11, 0.4)",
        icon: Star,
      };
    }
    if (type === "ribbon") {
      return {
        bgGradient: "from-blue-400 via-blue-500 to-indigo-600",
        border: "border-blue-200",
        shadow: "shadow-blue-500/25",
        text: "text-blue-950",
        glow: "rgba(37, 99, 235, 0.4)",
        icon: Award,
      };
    }
    if (medalType === "bronze") {
      return {
        bgGradient: "from-amber-600 via-orange-700 to-amber-900",
        border: "border-orange-300",
        shadow: "shadow-orange-700/25",
        text: "text-orange-950",
        glow: "rgba(194, 65, 12, 0.4)",
        icon: Shield,
      };
    }
    if (medalType === "silver") {
      return {
        bgGradient: "from-slate-200 via-slate-300 to-slate-500",
        border: "border-slate-100",
        shadow: "shadow-slate-500/25",
        text: "text-slate-900",
        glow: "rgba(148, 163, 184, 0.4)",
        icon: Shield,
      };
    }
    // Gold Medal / Champion
    return {
      bgGradient: "from-yellow-300 via-amber-400 to-yellow-600",
      border: "border-yellow-100",
      shadow: "shadow-yellow-500/35",
      text: "text-yellow-950",
      glow: "rgba(234, 179, 8, 0.5)",
      icon: Award,
    };
  };

  const theme = getSealTheme();
  const IconComponent = theme.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center focus:outline-none transition-all duration-300 ${className} ${
        isSelected ? "scale-105" : "hover:scale-102 opacity-90 hover:opacity-100"
      }`}
    >
      {/* Active Bookmark Ribbon Indicator */}
      <div
        className={`w-12 h-3 -mb-1 rounded-t-md transition-all duration-300 ${
          isSelected
            ? "bg-gradient-to-b from-blue-600 to-blue-500 shadow-sm"
            : isCompleted
            ? "bg-gradient-to-b from-amber-400/70 to-amber-500/80"
            : "bg-slate-300/40"
        }`}
      />

      {/* Main Wax & Gold Seal Body */}
      <div
        className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center p-1 transition-all duration-300 ${
          isSelected
            ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-amber-50"
            : ""
        } ${
          isLocked
            ? "bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-300/80 grayscale opacity-60"
            : `bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.border} shadow-lg ${theme.shadow}`
        }`}
        style={
          isCompleted
            ? {
                boxShadow: `0 0 18px ${theme.glow}, 0 4px 12px rgba(0,0,0,0.15)`,
              }
            : undefined
        }
      >
        {/* Decorative Scalloped Edge / Inner Rim */}
        <div
          className={`w-full h-full rounded-full border border-dashed flex flex-col items-center justify-center relative overflow-hidden ${
            isLocked
              ? "border-slate-400/50 bg-slate-200/50"
              : "border-white/50 bg-white/10"
          }`}
        >
          {/* Shimmer Light Reflection */}
          {!isLocked && (
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
          )}

          {/* Central Symbol */}
          {isLocked ? (
            <div className="flex flex-col items-center justify-center">
              <Lock className="w-5 h-5 text-slate-500 drop-shadow-xs" />
              <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                Stage {stageNumber}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <IconComponent className="w-6 h-6 text-white drop-shadow-sm" />
              <span className="text-[9px] font-black text-white tracking-wider uppercase drop-shadow-xs">
                Stage {stageNumber}
              </span>
            </div>
          )}

          {/* Mastered Checkmark Badge */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}

          {/* Active Sparkle Indicator */}
          {isInProgress && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
              <Sparkles className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Seal Title & Status */}
      <div className="text-center mt-2 max-w-[100px]">
        <span
          className={`text-xs font-bold block leading-tight truncate ${
            isSelected ? "text-blue-900" : "text-slate-700"
          }`}
        >
          {name}
        </span>
        <span
          className={`text-[10px] font-semibold block ${
            isCompleted
              ? "text-emerald-700"
              : isInProgress
              ? "text-blue-600 font-bold"
              : "text-slate-400"
          }`}
        >
          {isCompleted
            ? "✨ Unlocked"
            : isInProgress
            ? "Active Stage"
            : "🔒 Locked"}
        </span>
      </div>
    </button>
  );
}
