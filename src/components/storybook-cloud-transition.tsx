"use client";

import React from "react";
import { Cloud, Sparkles, Compass, ArrowRight } from "lucide-react";

/**
 * ── 1. Cloud Seam Divider ────────────────────────────────────────────────────
 * Positioned across the boundary between two chapter biomes to seamlessly mask
 * the cut between illustrated background stages with a lush, animated cloud bank.
 */
interface CloudSeamDividerProps {
  fromOrder: number;
  toOrder: number;
  fromName: string;
  toName: string;
  onTravel?: () => void;
}

export function CloudSeamDivider({
  fromOrder,
  toOrder,
  fromName,
  toName,
  onTravel,
}: CloudSeamDividerProps) {
  return (
    <div
      className="relative z-20 w-full h-32 -my-16 flex flex-col items-center justify-center select-none overflow-visible pointer-events-none"
      aria-hidden="true"
    >
      {/* ── Soft Misty Vignette Feathering (conceals the harsh cut) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/95 to-transparent h-full w-full pointer-events-none" />

      {/* ── Layer 1: Back Sky-Mist Clouds (Subtle cyan/slate tint for depth) ── */}
      <svg
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full text-sky-100/70 fill-current anim-cloud-drift pointer-events-none"
      >
        {/* Upper cloud scallops reaching upward */}
        <circle cx="80" cy="80" r="70" />
        <circle cx="220" cy="70" r="85" />
        <circle cx="380" cy="75" r="90" />
        <circle cx="530" cy="65" r="95" />
        <circle cx="680" cy="75" r="85" />
        <circle cx="820" cy="70" r="90" />
        <circle cx="950" cy="80" r="75" />

        {/* Lower cloud scallops reaching downward */}
        <circle cx="150" cy="95" r="75" />
        <circle cx="300" cy="100" r="85" />
        <circle cx="460" cy="105" r="80" />
        <circle cx="610" cy="95" r="90" />
        <circle cx="760" cy="100" r="85" />
        <circle cx="900" cy="95" r="75" />
      </svg>

      {/* ── Layer 2: Front Pillowy White Clouds (Pure white with soft drop-shadow) ── */}
      <svg
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full text-white fill-current filter drop-shadow-[0_4px_8px_rgba(15,23,42,0.08)] pointer-events-none anim-cloud-float"
      >
        {/* Dense central cloud mass */}
        <rect x="0" y="55" width="1000" height="50" />

        {/* Crisp billowing cloud domes (top crest) */}
        <circle cx="50" cy="70" r="55" />
        <circle cx="140" cy="55" r="65" />
        <circle cx="260" cy="50" r="75" />
        <circle cx="390" cy="45" r="80" />
        <circle cx="500" cy="40" r="85" />
        <circle cx="620" cy="45" r="80" />
        <circle cx="740" cy="50" r="75" />
        <circle cx="860" cy="55" r="65" />
        <circle cx="960" cy="70" r="55" />

        {/* Crisp billowing cloud domes (bottom crest) */}
        <circle cx="90" cy="95" r="55" />
        <circle cx="210" cy="105" r="65" />
        <circle cx="340" cy="110" r="70" />
        <circle cx="470" cy="115" r="75" />
        <circle cx="590" cy="110" r="70" />
        <circle cx="710" cy="105" r="65" />
        <circle cx="830" cy="100" r="60" />
        <circle cx="930" cy="95" r="55" />
      </svg>

      {/* ── Floating Whimsical Sparkles & Ambient Cloud Wisps ── */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-10 px-4">
        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/80 animate-pulse" />
        <Sparkles className="w-3.5 h-3.5 text-sky-400 fill-sky-300 animate-pulse delay-300" />
      </div>

      {/* ── Interactive Cloud Gateway Badge (bridges the two biomes) ── */}
      <div className="relative z-20 pointer-events-auto flex items-center justify-center">
        <button
          type="button"
          onClick={onTravel}
          title={`Travel from Chapter ${fromOrder} to Chapter ${toOrder}`}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white active:scale-95 transition-all shadow-md hover:shadow-lg border border-sky-200/90 text-slate-800 cursor-pointer backdrop-blur-md"
        >
          <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Cloud className="w-3 h-3 fill-sky-500 text-sky-500 animate-pulse" />
          </div>
          <span className="text-[11px] font-black tracking-tight text-slate-900">
            Cloud Crossing · Ch. {fromOrder} ➔ {toOrder}
          </span>
          <ArrowRight className="w-3 h-3 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/**
 * ── 2. Map-Scoped Cloud Wipe Transition Overlay ─────────────────────────────
 * Contained strictly within the map canvas (never the whole screen).
 * Clouds billow in from left & right to close halfway across the map,
 * and then part open as the new level is revealed.
 */
interface StorybookCloudWipeProps {
  phase: "idle" | "closing" | "closed" | "opening";
}

export function StorybookCloudWipe({ phase }: StorybookCloudWipeProps) {
  if (phase === "idle") return null;

  const isClosedOrClosing = phase === "closing" || phase === "closed";

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* ── Left Cloud Curtain (Closes halfway to 50%) ── */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 h-full bg-white/95 transition-transform ease-out will-change-transform ${
          isClosedOrClosing ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          transitionDuration: phase === "closing" ? "340ms" : "300ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Scalloped Puffy Cloud Edge on Right Boundary */}
        <div className="absolute -right-10 sm:-right-14 top-0 bottom-0 w-14 sm:w-20 h-full pointer-events-none">
          {/* Back Sky-Blue Depth Layer */}
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-sky-100 fill-current translate-x-1 opacity-75"
          >
            <path d="M0,0 Q90,60 40,120 Q110,180 50,240 Q120,310 60,380 Q110,450 45,520 Q120,590 55,660 Q100,730 40,780 L0,800 Z" />
          </svg>
          {/* Front Pure White Cloud Scallop */}
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-white fill-current filter drop-shadow-[2px_0_8px_rgba(15,23,42,0.1)]"
          >
            <path d="M0,0 Q80,50 35,110 Q105,170 45,230 Q115,300 55,370 Q105,440 40,510 Q115,580 50,650 Q95,720 35,770 L0,800 Z" />
          </svg>
        </div>
      </div>

      {/* ── Right Cloud Curtain (Closes halfway to 50%) ── */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 h-full bg-white/95 transition-transform ease-out will-change-transform ${
          isClosedOrClosing ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          transitionDuration: phase === "closing" ? "340ms" : "300ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Scalloped Puffy Cloud Edge on Left Boundary */}
        <div className="absolute -left-10 sm:-left-14 top-0 bottom-0 w-14 sm:w-20 h-full pointer-events-none">
          {/* Back Sky-Blue Depth Layer */}
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-sky-100 fill-current -translate-x-1 scale-x-[-1] opacity-75"
          >
            <path d="M0,0 Q90,60 40,120 Q110,180 50,240 Q120,310 60,380 Q110,450 45,520 Q120,590 55,660 Q100,730 40,780 L0,800 Z" />
          </svg>
          {/* Front Pure White Cloud Scallop */}
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-white fill-current scale-x-[-1] filter drop-shadow-[-2px_0_8px_rgba(15,23,42,0.1)]"
          >
            <path d="M0,0 Q80,50 35,110 Q105,170 45,230 Q115,300 55,370 Q105,440 40,510 Q115,580 50,650 Q95,720 35,770 L0,800 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * ── 3. Chapter Cloud Peek ───────────────────────────────────────────────────
 * Shows a peek/slice of the adjacent chapter (top for next stage, bottom for previous)
 * partially covered in billowy clouds. When the user scrolls into this zone,
 * the cloud transition is triggered to advance to that chapter.
 */
interface ChapterCloudPeekProps {
  type: "top" | "bottom";
  targetOrder: number;
  targetName: string;
  targetClimateName: string;
  targetClimateImgUrl: string;
}

export function ChapterCloudPeek({
  type,
  targetOrder,
  targetName,
  targetClimateName,
  targetClimateImgUrl,
}: ChapterCloudPeekProps) {
  const isTop = type === "top";

  return (
    <div
      className={`relative w-full h-28 sm:h-32 select-none overflow-hidden border-x border-slate-300 bg-white ${
        isTop ? "border-b border-slate-200" : "border-t border-slate-200"
      }`}
    >
      {/* Peek of the adjacent chapter image (blurred & darkened slightly) */}
      <img
        src={targetClimateImgUrl}
        alt={`Peek of Chapter ${targetOrder}`}
        className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[1px] select-none pointer-events-none"
      />

      {/* Misty cloud gradient overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isTop
            ? "bg-gradient-to-b from-white/95 via-white/80 to-transparent"
            : "bg-gradient-to-t from-white/95 via-white/80 to-transparent"
        }`}
      />

      {/* Billowing cloud SVG bank */}
      <svg
        viewBox="0 0 600 120"
        preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full text-white fill-current filter drop-shadow-md pointer-events-none anim-cloud-float ${
          isTop ? "" : "rotate-180"
        }`}
      >
        <circle cx="60" cy="80" r="50" />
        <circle cx="160" cy="70" r="60" />
        <circle cx="280" cy="65" r="70" />
        <circle cx="410" cy="70" r="65" />
        <circle cx="530" cy="80" r="55" />
      </svg>

      {/* Floating prompt pill */}
      <div
        className={`absolute inset-x-0 ${
          isTop ? "top-3 sm:top-4" : "bottom-3 sm:bottom-4"
        } flex flex-col items-center justify-center gap-1 z-10 pointer-events-none px-4 text-center`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-sky-200/90 text-slate-900 text-xs font-bold">
          <Cloud className="w-3.5 h-3.5 text-sky-500 fill-sky-200 animate-pulse" />
          <span>
            {isTop ? "Next: " : "Previous: "}Chapter {targetOrder} · {targetName}
          </span>
          <span className="text-[10px] text-sky-600 font-semibold hidden sm:inline">
            ({targetClimateName})
          </span>
        </div>

        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 drop-shadow-xs flex items-center gap-1 animate-pulse">
          {isTop ? "↑ Scroll up to enter through the clouds ↑" : "↓ Scroll down to return through the clouds ↓"}
        </span>
      </div>
    </div>
  );
}
