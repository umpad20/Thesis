"use client";

import React from "react";
import { Cloud, Compass, ArrowRight } from "lucide-react";

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
        className="absolute inset-0 w-full h-full fill-sky-100/70 anim-cloud-drift pointer-events-none"
      >
        {/* Organic cloud silhouette — back layer */}
        <path d="M0,100 C50,60 100,30 180,50 C260,70 300,20 400,40 C500,60 520,10 620,35 C720,60 780,25 860,45 C940,65 970,40 1000,60 L1000,160 L0,160 Z" />
        <path d="M0,120 C80,140 120,110 200,125 C280,140 340,100 440,115 C540,130 600,95 700,110 C800,125 860,100 940,115 C980,125 1000,110 1000,120 L1000,160 L0,160 Z" />
      </svg>

      {/* ── Layer 2: Front Pillowy White Clouds ── */}
      <svg
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full fill-white filter drop-shadow-[0_4px_8px_rgba(15,23,42,0.08)] pointer-events-none anim-cloud-float"
      >
        {/* Dense central fill */}
        <rect x="0" y="65" width="1000" height="95" />
        {/* Organic bumpy top crest */}
        <path d="M0,80 C30,65 70,40 130,50 C190,60 220,25 290,35 C360,45 400,15 470,30 C540,45 570,10 640,25 C710,40 750,15 820,30 C890,45 930,20 970,40 C990,50 1000,55 1000,65 L1000,160 L0,160 Z" />
        {/* Organic bumpy bottom crest */}
        <path d="M0,130 C40,145 80,155 140,140 C200,125 260,150 340,135 C420,120 480,145 560,130 C640,115 700,140 780,130 C860,120 920,140 1000,130 L1000,160 L0,160 Z" />
      </svg>

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
 * Uses organic SVG cloud-edge paths (not circles!) for natural fluffy silhouettes.
 */
interface StorybookCloudWipeProps {
  phase: "idle" | "closing" | "closed" | "opening";
}

/**
 * Organic cloud edge path — drawn as a vertical strip with natural bumps.
 * The path goes from top-to-bottom along x=0..120, with the right side
 * being the fluffy cloud edge (bumps outward) and left side a straight line.
 * Mirror horizontally for the right cloud bank.
 */
const LEFT_CLOUD_EDGE_PATH =
  "M0,0 L120,0 " +
  "C115,20 130,35 118,55 " +
  "C105,70 135,85 125,105 " +
  "C112,125 140,140 130,165 " +
  "C118,185 145,200 135,225 " +
  "C120,250 150,265 140,290 " +
  "C128,310 155,325 142,350 " +
  "C130,370 158,390 145,415 " +
  "C132,435 160,450 148,475 " +
  "C136,495 162,515 150,540 " +
  "C138,560 165,580 152,605 " +
  "C140,625 168,645 155,670 " +
  "C142,690 170,710 158,735 " +
  "C145,755 172,775 160,800 " +
  "C148,820 175,840 162,860 " +
  "C150,880 178,900 165,925 " +
  "C152,945 180,960 168,985 " +
  "C155,1000 120,1000 120,1000 " +
  "L0,1000 Z";

const RIGHT_CLOUD_EDGE_PATH =
  "M120,0 L0,0 " +
  "C5,25 -15,40 2,60 " +
  "C15,80 -12,95 -5,120 " +
  "C8,140 -18,160 -10,185 " +
  "C2,210 -22,230 -12,255 " +
  "C0,280 -25,300 -15,325 " +
  "C-2,350 -28,370 -18,395 " +
  "C-5,420 -30,440 -20,465 " +
  "C-8,490 -32,510 -22,535 " +
  "C-5,560 -35,580 -25,605 " +
  "C-8,630 -38,650 -28,675 " +
  "C-5,700 -35,720 -25,745 " +
  "C-2,770 -32,790 -22,815 " +
  "C0,840 -28,860 -18,885 " +
  "C5,910 -25,930 -15,955 " +
  "C8,975 0,1000 0,1000 " +
  "L120,1000 Z";

export function StorybookCloudWipe({ phase }: StorybookCloudWipeProps) {
  if (phase === "idle") return null;

  const isClosedOrClosing = phase === "closing" || phase === "closed";
  const transitionDuration = phase === "closing" ? "340ms" : "320ms";
  const timingFunction =
    phase === "closing"
      ? "cubic-bezier(0.2, 0.9, 0.3, 1)"
      : "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex items-center justify-center select-none"
      aria-hidden="true"
    >
      {/* ── 1. Soft Ambient Sky-Mist Wash ── */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-sky-100/70 via-white/80 to-sky-100/70 backdrop-blur-xs transition-opacity pointer-events-none z-10 ${
          isClosedOrClosing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transitionDuration: phase === "closing" ? "260ms" : "300ms",
        }}
      />

      {/* ── 2. Left Cloud Bank ── */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[58%] h-full bg-white transition-transform ease-out will-change-transform z-20 ${
          isClosedOrClosing ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          transitionDuration,
          transitionTimingFunction: timingFunction,
        }}
      >
        {/* Organic cloud edge — back shadow layer */}
        <svg
          className="absolute top-0 right-0 h-full pointer-events-none overflow-visible"
          style={{ width: 80, transform: "translateX(55px)" }}
          viewBox="0 0 120 1000"
          preserveAspectRatio="none"
          fill="#e0f2fe"
        >
          <path d={LEFT_CLOUD_EDGE_PATH} opacity="0.85" />
        </svg>
        {/* Organic cloud edge — front white layer */}
        <svg
          className="absolute top-0 right-0 h-full pointer-events-none overflow-visible"
          style={{ width: 72, transform: "translateX(45px)", filter: "drop-shadow(3px 0 8px rgba(15,23,42,0.06))" }}
          viewBox="0 0 120 1000"
          preserveAspectRatio="none"
          fill="white"
        >
          <path d={LEFT_CLOUD_EDGE_PATH} />
        </svg>
      </div>

      {/* ── 3. Right Cloud Bank ── */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-[58%] h-full bg-white transition-transform ease-out will-change-transform z-20 ${
          isClosedOrClosing ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          transitionDuration,
          transitionTimingFunction: timingFunction,
        }}
      >
        {/* Organic cloud edge — back shadow layer */}
        <svg
          className="absolute top-0 left-0 h-full pointer-events-none overflow-visible"
          style={{ width: 80, transform: "translateX(-55px)" }}
          viewBox="0 0 120 1000"
          preserveAspectRatio="none"
          fill="#e0f2fe"
        >
          <path d={RIGHT_CLOUD_EDGE_PATH} opacity="0.85" />
        </svg>
        {/* Organic cloud edge — front white layer */}
        <svg
          className="absolute top-0 left-0 h-full pointer-events-none overflow-visible"
          style={{ width: 72, transform: "translateX(-45px)", filter: "drop-shadow(-3px 0 8px rgba(15,23,42,0.06))" }}
          viewBox="0 0 120 1000"
          preserveAspectRatio="none"
          fill="white"
        >
          <path d={RIGHT_CLOUD_EDGE_PATH} />
        </svg>
      </div>

      {/* ── 4. Center twinkle (visible during closed hold) ── */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none z-30 ${
          phase === "closed"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-white/70 filter blur-lg animate-pulse" />
          <Cloud className="w-8 h-8 text-sky-400 fill-sky-200/80 animate-pulse absolute drop-shadow-sm" />
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
        <path d="M0,70 C30,50 70,30 130,45 C190,60 230,25 300,35 C370,45 410,15 480,30 C550,45 600,20 600,40 L600,120 L0,120 Z" />
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
