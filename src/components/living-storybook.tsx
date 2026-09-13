"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Lock,
  Flame,
  Award,
  Star,
  Trophy,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Cloud,
  GraduationCap,
  Play,
  RotateCcw,
  Compass,
  Map as MapIcon,
  Navigation,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateModal } from "@/components/certificate-modal";
import { getCurrentUser } from "@/utils/auth-helpers";
import { StorybookCloudWipe } from "@/components/storybook-cloud-transition";
import type { Badge, Lesson, StudentBadgeProgress, BadgeType, MedalType } from "@/lib/types";

export interface LivingStorybookProps {
  badges: Badge[];
  allLessons: Lesson[];
  badgeProgress: StudentBadgeProgress[];
  lessonProgress: Record<
    number,
    { status: "completed" | "in_progress" | "locked"; highest_score: number }
  >;
  currentUserSection?: string;
  totalXp?: number;
  streakDays?: number;
}

const UNIFIED_BADGE_ASSETS: Record<number, string> = {
  1: "/images/badges/badge_stage_1_star.png",
  2: "/images/badges/badge_stage_2_ribbon.png",
  3: "/images/badges/badge_stage_3_bronze.png",
  4: "/images/badges/badge_stage_4_silver.png",
  5: "/images/badges/badge_stage_5_gold.png",
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

// Biome climate metadata for each chapter
interface ClimateTheme {
  name: string;
  tagline: string;
  icon: string;
  accentColor: string;
  pillBg: string;
}

const CLIMATE_THEMES: Record<number, ClimateTheme> = {
  1: {
    name: "Sunny Meadows",
    tagline: "Warm Grasslands & Wildflowers",
    icon: "🌿",
    accentColor: "#16a34a",
    pillBg: "bg-emerald-500 text-white",
  },
  2: {
    name: "River Crossing",
    tagline: "Azure Waterways & Stone Bridge",
    icon: "🌊",
    accentColor: "#0284c7",
    pillBg: "bg-sky-500 text-white",
  },
  3: {
    name: "Autumn Highlands",
    tagline: "Amber Leaves & Canyon Slopes",
    icon: "🍂",
    accentColor: "#ea580c",
    pillBg: "bg-amber-600 text-white",
  },
  4: {
    name: "Frostpeak Glades",
    tagline: "Winter Snow & Pine Glades",
    icon: "❄️",
    accentColor: "#0284c7",
    pillBg: "bg-cyan-600 text-white",
  },
  5: {
    name: "Celestial Summit",
    tagline: "Starlit Peak & Champion Citadel",
    icon: "🏆",
    accentColor: "#f59e0b",
    pillBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950",
  },
};

function getClimate(order: number): ClimateTheme {
  return (
    CLIMATE_THEMES[order] || {
      name: `Chapter ${order}`,
      tagline: "Adventure Trail",
      icon: "⭐",
      accentColor: "#3b82f6",
      pillBg: "bg-blue-600 text-white",
    }
  );
}

// Road percentage coordinates within each 572x1024 climate stage
function getLessonCoords(idx: number, totalInChapter: number) {
  if (totalInChapter <= 3) {
    if (idx === 0) return { xPct: 36, yPct: 78 };
    if (idx === 1) return { xPct: 68, yPct: 60 };
    return { xPct: 34, yPct: 40 };
  }
  if (idx === 0) return { xPct: 36, yPct: 80 };
  if (idx === 1) return { xPct: 68, yPct: 64 };
  if (idx === 2) return { xPct: 34, yPct: 44 };
  return { xPct: 64, yPct: 26 };
}

// Milestone Pedestal coordinate at top of chapter
function getMilestoneCoord(order: number) {
  if (order === 5) return { xPct: 57, yPct: 15 };
  return { xPct: 52, yPct: 15 };
}

export function LivingStorybook({
  badges,
  allLessons,
  badgeProgress,
  lessonProgress = {},
  currentUserSection = "Grade 3-A",
  totalXp = 0,
  streakDays = 0,
}: LivingStorybookProps) {
  // 1. Separate Core DepEd Badges (Stages 1-5) and Teacher-Made Quests (Stage 6+)
  const coreBadges = badges.filter((b) => b.badge_id <= 5);
  const teacherBadges = badges.filter((b) => b.badge_id > 5);

  const [activePathwayTab, setActivePathwayTab] = useState<"core" | "teacher">("core");
  const [showCertificate, setShowCertificate] = useState(false);

  // Strictly check that Stage 5 Gold Badge has been completed
  const isStage5Passed = badgeProgress.some(
    (p) => Number(p.badge_id) === 5 && p.status === "completed"
  );
  const isAllCoreStagesCompleted = isStage5Passed;
  const currentUser = getCurrentUser();
  const studentName = currentUser?.fullName || "Student";

  // Badges sorted in ascending order (1, 2, 3, 4, 5)
  const displayedBadges = useMemo(() => {
    return (activePathwayTab === "core" ? coreBadges : teacherBadges).sort(
      (a, b) => (a.badge_order || 0) - (b.badge_order || 0)
    );
  }, [activePathwayTab, coreBadges, teacherBadges]);

  // Segments layout: Chapter 1 is at bottom, Chapter 5 is at top
  // In DOM flow from top to bottom: Chapter 5 first, then 4, 3, 2, 1 at bottom!
  const chaptersFromTopToBottom = useMemo(() => {
    return [...displayedBadges].sort(
      (a, b) => (b.badge_order || 0) - (a.badge_order || 0)
    );
  }, [displayedBadges]);

  const SEGMENT_HEIGHT = 640;
  const totalHeight = Math.max(displayedBadges.length, 1) * SEGMENT_HEIGHT;

  // State for active popup card interactions (pure hover-based)
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global pointer listener: immediately dismiss any open node card when tapping or clicking outside
  useEffect(() => {
    const handleGlobalPointer = (e: PointerEvent) => {
      if (!(e.target as HTMLElement | null)?.closest("[data-node-interactive]")) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setHoveredNodeId(null);
      }
    };
    window.addEventListener("pointerdown", handleGlobalPointer);
    return () => window.removeEventListener("pointerdown", handleGlobalPointer);
  }, []);

  const handleNodeMouseEnter = (lessonId: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredNodeId(lessonId);
  };

  const handleNodeMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 100);
  };

  const handleNodeClick = (lessonId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Toggle card on click/tap: if already open, close it; otherwise open it
    setHoveredNodeId((prev) => (prev === lessonId ? null : lessonId));
  };

  const handleTabSwitch = (tab: "core" | "teacher") => {
    if (tab === activePathwayTab) return;
    setActivePathwayTab(tab);
  };

  // Scroll container and chapter section anchors
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const chapterRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Function to check if a specific chapter is locked
  const isChapterLocked = (badge: Badge): boolean => {
    if (badge.badge_order === 1 || badge.teacher_id || activePathwayTab === "teacher") {
      return false;
    }
    const bProg = badgeProgress.find((p) => Number(p.badge_id) === Number(badge.badge_id));
    const chLessons = allLessons.filter((l) => l.badge_id === badge.badge_id);
    const hasFinishedLesson = chLessons.some(
      (l) => lessonProgress[l.lesson_id]?.status === "completed"
    );

    if (
      bProg?.status === "completed" ||
      bProg?.status === "in_progress" ||
      Boolean(bProg?.earned_date) ||
      (bProg?.completion_percentage || 0) > 0 ||
      hasFinishedLesson
    ) {
      return false;
    }

    const prevBadge = displayedBadges.find(
      (b) => !b.teacher_id && b.badge_order === (badge.badge_order || 1) - 1
    );
    if (!prevBadge) return false;

    const prevProg = badgeProgress.find((p) => Number(p.badge_id) === Number(prevBadge.badge_id));
    if (!prevProg) return true;

    const isPrevDone =
      prevProg.status === "completed" ||
      Boolean(prevProg.earned_date) ||
      (prevProg.completion_percentage || 0) >= 100;

    return !isPrevDone;
  };

  // Helper to check if a specific lesson is unlocked
  const isLessonUnlocked = (lesson: Lesson, indexInChapter: number, chapterBadge: Badge) => {
    const isDone = lessonProgress[lesson.lesson_id]?.status === "completed";
    if (isDone) return true;
    if (isChapterLocked(chapterBadge)) return false;
    if (indexInChapter === 0) return true;

    const chLessons = allLessons.filter((l) => l.badge_id === chapterBadge.badge_id);
    const prevLesson = chLessons[indexInChapter - 1];
    return lessonProgress[prevLesson.lesson_id]?.status === "completed";
  };

  // Find the single current active lesson in the entire journey
  let currentActiveLesson: Lesson | null = null;
  let currentActiveChapter: Badge | null = null;

  for (const badge of displayedBadges) {
    if (isChapterLocked(badge)) continue;
    const chLessons = allLessons.filter((l) => l.badge_id === badge.badge_id);
    for (let idx = 0; idx < chLessons.length; idx++) {
      const l = chLessons[idx];
      const isDone = lessonProgress[l.lesson_id]?.status === "completed";
      if (!isDone && isLessonUnlocked(l, idx, badge)) {
        currentActiveLesson = l;
        currentActiveChapter = badge;
        break;
      }
    }
    if (currentActiveLesson) break;
  }

  // ── Single-Chapter Focus & Cloud Transition State ──────────────────────────
  const initialChapterOrder = currentActiveChapter?.badge_order || 1;
  const [activeChapterOrder, setActiveChapterOrder] = useState<number>(initialChapterOrder);
  const [cloudPhase, setCloudPhase] = useState<
    "idle" | "closing" | "closed" | "opening"
  >("idle");
  const [transitionTarget, setTransitionTarget] = useState<{
    order: number;
    name: string;
    climateName?: string;
  } | null>(null);

  // Transition locking & cooldown refs
  const isTransitioningRef = useRef(false);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const overscrollUpRef = useRef<number>(0);
  const overscrollDownRef = useRef<number>(0);
  const overscrollResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Theatrical cloud closing & opening transition when scrolling/jumping between levels
  const triggerCloudTransition = (
    targetBadgeOrder: number,
    enterFrom: "top" | "bottom" | "auto" = "auto"
  ) => {
    if (isTransitioningRef.current || cloudPhase !== "idle") return;
    const targetBadge = displayedBadges.find((b) => b.badge_order === targetBadgeOrder);
    if (!targetBadge) return;

    isTransitioningRef.current = true;
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
    }

    setTransitionTarget({
      order: targetBadge.badge_order,
      name: targetBadge.badge_name,
      climateName: getClimate(targetBadge.badge_order).name,
    });

    setCloudPhase("closing");

    // Phase 1: Wait for clouds to roll in and close across map canvas (340ms)
    setTimeout(() => {
      setCloudPhase("closed");
      setActiveChapterOrder(targetBadgeOrder);

      // Phase 2: Brief hold (90ms) while closed to let new chapter canvas settle
      setTimeout(() => {
        setCloudPhase("opening");

        // Phase 3: Clouds part open to reveal destination chapter (320ms)
        setTimeout(() => {
          setCloudPhase("idle");
          setTransitionTarget(null);

          // 350ms cooldown to swallow momentum inertia before accepting another trigger
          cooldownTimeoutRef.current = setTimeout(() => {
            isTransitioningRef.current = false;
          }, 350);
        }, 320);
      }, 90);
    }, 340);
  };

  // Switch to current active level with cloud wipe transition
  const scrollToCurrentLevel = () => {
    const targetOrder = currentActiveChapter?.badge_order || 1;
    if (targetOrder !== activeChapterOrder) {
      triggerCloudTransition(targetOrder, "auto");
    }
  };

  // Mouse wheel gesture to travel between chapters
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isTransitioningRef.current || cloudPhase !== "idle") return;

    // Rolling wheel UP -> Next Chapter through clouds
    if (e.deltaY < -25 && activeChapterOrder < displayedBadges.length) {
      triggerCloudTransition(activeChapterOrder + 1, "bottom");
      return;
    }

    // Rolling wheel DOWN -> Previous Chapter through clouds
    if (e.deltaY > 25 && activeChapterOrder > 1) {
      triggerCloudTransition(activeChapterOrder - 1, "top");
      return;
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || isTransitioningRef.current || cloudPhase !== "idle") return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartYRef.current;
    touchStartYRef.current = null;

    // Swipe up -> Next Chapter
    if (deltaY < -40 && activeChapterOrder < displayedBadges.length) {
      triggerCloudTransition(activeChapterOrder + 1, "bottom");
      return;
    }

    // Swipe down -> Previous Chapter
    if (deltaY > 40 && activeChapterOrder > 1) {
      triggerCloudTransition(activeChapterOrder - 1, "top");
      return;
    }
  };

  // Active Chapter Information
  const activeBadge =
    displayedBadges.find((b) => b.badge_order === activeChapterOrder) ||
    displayedBadges[0];
  const activeClimate = getClimate(activeBadge?.badge_order || 1);

  const hasNextChapter = activeChapterOrder < displayedBadges.length;
  const nextBadge = hasNextChapter
    ? displayedBadges.find((b) => b.badge_order === activeChapterOrder + 1)
    : null;
  const nextClimate = nextBadge
    ? getClimate(nextBadge.badge_order || activeChapterOrder + 1)
    : null;

  const hasPrevChapter = activeChapterOrder > 1;
  const prevBadge = hasPrevChapter
    ? displayedBadges.find((b) => b.badge_order === activeChapterOrder - 1)
    : null;
  const prevClimate = prevBadge
    ? getClimate(prevBadge.badge_order || activeChapterOrder - 1)
    : null;

  const activeChapterLessons = allLessons.filter((l) => l.badge_id === activeBadge?.badge_id);
  const activeChapterCompletedCount = activeChapterLessons.filter(
    (l) => lessonProgress[l.lesson_id]?.status === "completed"
  ).length;

  return (
    <div className="relative w-full flex-1 flex flex-col min-h-0 select-none bg-white">
      {/* ── 1. Mobile Map Navigation Header (Kept on top in mobile nav; hidden on desktop) ─────────── */}
      <div className="lg:hidden sticky top-0 z-20 w-full h-11 px-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Left: Map Title & Pupil Section */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-900 tracking-tight block leading-tight truncate">
              Adventure Trail
            </span>
            <span className="text-[10px] text-blue-600 font-semibold block leading-tight truncate">
              {currentUserSection}
            </span>
          </div>
        </div>

        {/* Right Controls: Quests & Current Level (Kept at top on mobile) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {teacherBadges.length > 0 && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[10px] font-medium shrink-0">
              <button
                type="button"
                onClick={() => handleTabSwitch("core")}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  activePathwayTab === "core"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Core
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("teacher")}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  activePathwayTab === "teacher"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Quests ({teacherBadges.length})</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={scrollToCurrentLevel}
            className="h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
            title="Jump to current level"
          >
            <Navigation className="w-3 h-3 fill-white text-white" />
            <span>Level</span>
          </button>
        </div>
      </div>

      {/* ── 2. Centered Mobile-First Map Viewport (.map-viewport) ─────────── */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setHoveredNodeId(null);
        }}
        onPointerMove={(e) => {
          if (!(e.target as HTMLElement).closest("[data-node-interactive]")) {
            if (hoveredNodeId !== null) {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              setHoveredNodeId(null);
            }
          }
        }}
        onPointerLeave={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setHoveredNodeId(null);
        }}
        className="map-viewport relative w-full flex-1 min-h-0 overflow-hidden select-none bg-white flex items-center justify-center p-2 sm:p-3 pb-20 md:pb-3"
      >
        {/* Centered Map Column Container (Allows navigation badges to sit outside in the white blank space on desktop) */}
        <div
          style={{ aspectRatio: "572 / 1024" }}
          className="relative h-full max-h-full max-w-full aspect-[572/1024] mx-auto flex items-center justify-center"
        >
          {/* ── Outside Floating Guide: Separate Modular Boxes (Desktop side UI) ── */}
          <div className="hidden lg:flex flex-col gap-2 absolute top-6 right-[calc(100%+14px)] z-30 pointer-events-auto w-44 sm:w-48 select-none">
            {/* Box 1: Chapter Information Card */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-md hover:shadow-lg transition-all flex flex-col gap-1 w-full select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  Chapter {activeChapterOrder}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug tracking-tight truncate" title={activeBadge?.badge_name}>
                {activeBadge?.badge_name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="truncate max-w-[90px]">{activeClimate.name}</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-600 whitespace-nowrap">
                  {activeChapterCompletedCount}/{activeChapterLessons.length} done
                </span>
              </div>
            </div>

            {/* Box 2: Total Progress Card */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-md hover:shadow-lg transition-all flex items-center justify-between text-xs w-full select-none">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Total Progress</span>
              </div>
              <span className="text-[11px] font-bold text-slate-900">
                {Object.values(lessonProgress).filter((p) => p.status === "completed").length} / {allLessons.length}
              </span>
            </div>

            {/* Box 3: Core & Teacher Quests Toggle (if teacher quests exist) */}
            {teacherBadges.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-md hover:shadow-lg transition-all w-full select-none">
                <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium w-full">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("core")}
                    className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer text-[11px] ${
                      activePathwayTab === "core"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 font-medium"
                    }`}
                  >
                    Core
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("teacher")}
                    className={`flex-1 py-1 rounded-lg text-center transition-all flex items-center justify-center gap-1 cursor-pointer text-[11px] ${
                      activePathwayTab === "teacher"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Quests ({teacherBadges.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Box 4: Current Level Button */}
            <button
              type="button"
              onClick={scrollToCurrentLevel}
              className="w-full bg-white/95 hover:bg-blue-600 text-slate-800 hover:text-white backdrop-blur-md border border-slate-200/90 hover:border-blue-600 rounded-2xl p-2.5 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold text-xs group active:scale-95 select-none"
              title="Jump to current level"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-600 flex items-center justify-center shadow-2xs transition-colors">
                <Navigation className="w-3 h-3 fill-current" />
              </div>
              <span>Current Level</span>
            </button>
          </div>

          {/* ── Outside Floating Guide: Next Chapter (Desktop only in white space) ── */}
          {hasNextChapter && nextBadge && (
            <div className="hidden lg:block absolute top-6 left-[calc(100%+14px)] z-30 pointer-events-auto">
              <button
                type="button"
                onClick={() => triggerCloudTransition(activeChapterOrder + 1, "bottom")}
                title={`Travel to Chapter ${nextBadge.badge_order}: ${nextBadge.badge_name}`}
                className="group flex flex-col items-center gap-1 cursor-pointer select-none transition-transform active:scale-90"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl flex items-center justify-center border-2 border-white transition-all group-hover:scale-110 animate-bounce">
                  <ArrowUp className="w-5 h-5 stroke-[2.8]" />
                </div>
                <span className="text-[11px] font-black text-slate-700 tracking-tight whitespace-nowrap drop-shadow-xs">
                  Ch. {nextBadge.badge_order}
                </span>
              </button>
            </div>
          )}

          {/* ── Outside Floating Guide: Previous Chapter (Desktop only in white space) ── */}
          {hasPrevChapter && prevBadge && (
            <div className="hidden lg:block absolute bottom-8 left-[calc(100%+14px)] z-30 pointer-events-auto">
              <button
                type="button"
                onClick={() => triggerCloudTransition(activeChapterOrder - 1, "top")}
                title={`Return to Chapter ${prevBadge.badge_order}: ${prevBadge.badge_name}`}
                className="group flex flex-col items-center gap-1 cursor-pointer select-none transition-transform active:scale-90"
              >
                <span className="text-[11px] font-black text-slate-700 tracking-tight whitespace-nowrap drop-shadow-xs">
                  Ch. {prevBadge.badge_order}
                </span>
                <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl flex items-center justify-center border-2 border-white transition-all group-hover:scale-110 animate-bounce">
                  <ArrowDown className="w-5 h-5 stroke-[2.8]" />
                </div>
              </button>
            </div>
          )}

          {/* Single-Chapter Map Canvas (Bordered and overflow-hidden to keep map artwork & clouds strictly inside) */}
          <div className="relative w-full h-full border border-slate-300/80 bg-white overflow-hidden shadow-md rounded-2xl">
            {/* Map-Scoped Cloud Wipe Transition Overlay: strictly confined to the map canvas */}
            <StorybookCloudWipe phase={cloudPhase} />

          {/* Active Chapter Canvas */}
          {(() => {
            const badge = activeBadge;
            const order = activeBadge.badge_order || 1;
            const isLocked = isChapterLocked(activeBadge);
            const chLessons = allLessons.filter((l) => l.badge_id === activeBadge.badge_id);
            const completedCount = chLessons.filter(
              (l) => lessonProgress[l.lesson_id]?.status === "completed"
            ).length;
            const isAllDone = chLessons.length > 0 && completedCount === chLessons.length;
            const badgeProg = badgeProgress.find(
              (p) => Number(p.badge_id) === Number(activeBadge.badge_id)
            );
            const isMastered = badgeProg?.status === "completed";
            const climate = getClimate(order);
            const climateImgOrder = order <= 5 ? order : ((order - 1) % 5) + 1;
            const climateImgUrl = `/images/climates/climate_stage_${climateImgOrder}.jpg`;

            const milestoneCoord = getMilestoneCoord(order);

            return (
              <div
                key={`chapter-section-${badge.badge_id}`}
                ref={(el) => {
                  chapterRefs.current[order] = el;
                }}
                className="relative w-full h-full select-none overflow-hidden"
              >
                {/* Photorealistic Climate Stage Background Artwork: Preserving natural 572x1024 mobile aspect ratio */}
                <img
                  src={climateImgUrl}
                  alt={`Climate Biome ${order}: ${climate.name}`}
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Subtle atmospheric vignette at chapter top & bottom boundaries for seamless blending */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/20 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/20 to-transparent z-10" />

                  {/* ── Stepping Stones for Chapter Lessons (Ascending Down to Top) ── */}
                  {chLessons.map((lesson, idx) => {
                    const prog = lessonProgress[lesson.lesson_id];
                    const isDone = prog?.status === "completed";
                    const isUnlocked = isLessonUnlocked(lesson, idx, badge);
                    const isCurrentActive =
                      currentActiveLesson?.lesson_id === lesson.lesson_id;

                    const coord = getLessonCoords(idx, chLessons.length);
                    const isCardOpen = hoveredNodeId === lesson.lesson_id;

                    // Pop down for higher nodes, pop up for lower nodes
                    const popDown = coord.yPct < 45;

                    return (
                      <div
                        key={lesson.lesson_id}
                        data-node-interactive="true"
                        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20"
                        style={{
                          left: `${coord.xPct}%`,
                          top: `${coord.yPct}%`,
                        }}
                        onMouseEnter={() => handleNodeMouseEnter(lesson.lesson_id)}
                        onMouseLeave={handleNodeMouseLeave}
                        onPointerLeave={handleNodeMouseLeave}
                      >
                        {/* ── Case A: Completed Node (Golden Yellow Stepping Stone matching map road) ── */}
                        {isDone ? (
                          <div className="group relative flex flex-col items-center">
                            <button
                              type="button"
                              onClick={(e) => handleNodeClick(lesson.lesson_id, e)}
                              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-3 sm:border-4 border-yellow-100 shadow-[0_5px_0_#b45309,0_8px_16px_rgba(180,83,9,0.35)] flex items-center justify-center font-black text-amber-950 text-lg sm:text-xl group-hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                              title="Click to view Re-read and Retake options"
                            >
                              <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">{idx + 1}</span>

                              {/* Completion Checkmark Badge */}
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow-xs pointer-events-none">
                                <Check className="w-3 h-3 stroke-[3.5]" />
                              </div>

                              {/* Gold Star Badge */}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 border-2 border-white flex items-center justify-center shadow-xs pointer-events-none">
                                <Star className="w-3 h-3 fill-amber-950 text-amber-950" />
                              </div>
                            </button>

                            {/* Interactive Action Card (Re-read & Retake) */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={() => handleNodeMouseEnter(lesson.lesson_id)}
                              onMouseLeave={handleNodeMouseLeave}
                              onPointerLeave={handleNodeMouseLeave}
                              className={`absolute ${
                                popDown ? "top-full mt-2" : "bottom-full mb-2"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] bg-[#fffdf8] border border-amber-300/90 rounded-xl p-2 shadow-xl z-50 text-center transition-all duration-200 ${
                                isCardOpen
                                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                                  : "opacity-0 scale-95 pointer-events-none invisible"
                              }`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#fffdf8] ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-amber-300"
                                    : "-bottom-1.5 border-b border-r border-amber-300"
                                } rotate-45`}
                              />

                              {/* Story Title & Score */}
                              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-900 mb-0.5">
                                <BookOpen className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[140px] leading-tight">
                                  {lesson.lesson_title}
                                </span>
                              </div>
                              <div className="text-[9px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                                <span>Mastered · Score: {prog?.highest_score || 100}%</span>
                              </div>

                              {/* Action Buttons: Re-read & Retake */}
                              <div className="grid grid-cols-2 gap-1">
                                <Link href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}>
                                  <button
                                    type="button"
                                    className="w-full py-1 px-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-[10px] shadow-2xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>Re-read</span>
                                  </button>
                                </Link>

                                <Link href={`/dashboard/quiz?lessonId=${lesson.lesson_id}`}>
                                  <button
                                    type="button"
                                    className="w-full py-1 px-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 active:scale-95 text-amber-950 font-bold text-[10px] shadow-2xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Retake</span>
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ) : isCurrentActive ? (
                          /* ── Case B: Active Node (Prominently Highlighted Current Level) ── */
                          <div className="relative flex flex-col items-center z-25">
                            {/* Radiant Outer Radar Pulse Rings */}
                            <div className="absolute inset-0 -m-2 sm:-m-3 rounded-full border-2 border-blue-400 animate-ping opacity-40 pointer-events-none" />
                            <div className="absolute inset-0 -m-1 sm:-m-1.5 rounded-full ring-4 ring-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.85)] pointer-events-none" />

                            {/* "Current Level" Floating Badge Tag */}
                            <div className="absolute -top-4 sm:-top-5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md border border-slate-700 flex items-center gap-1 whitespace-nowrap z-30 animate-bounce pointer-events-none">
                              <Navigation className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Current Level</span>
                            </div>

                            {/* Stepping Stone */}
                            <button
                              type="button"
                              onClick={(e) => handleNodeClick(lesson.lesson_id, e)}
                              className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 border-4 border-blue-200 shadow-[0_0_35px_rgba(37,99,235,0.9),0_6px_0_#1e3a8a] flex items-center justify-center font-black text-white text-lg sm:text-xl animate-pulse cursor-pointer select-none"
                            >
                              <span>{idx + 1}</span>
                            </button>

                            {/* Floating Parchment Quest Pop-up Card (Only appears on hover / click) */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={() => handleNodeMouseEnter(lesson.lesson_id)}
                              onMouseLeave={handleNodeMouseLeave}
                              onPointerLeave={handleNodeMouseLeave}
                              className={`absolute ${
                                popDown ? "top-full mt-2" : "bottom-full mb-2"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] z-40 transition-all duration-200 ${
                                isCardOpen
                                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                                  : "opacity-0 scale-95 pointer-events-none invisible"
                              }`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-blue-700"
                                    : "-bottom-1.5 border-b border-r border-blue-700"
                                } rotate-45 z-10`}
                              />

                              {/* Card body */}
                              <div className="relative rounded-xl overflow-hidden border border-blue-400/90 shadow-xl bg-white">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 flex items-center justify-center gap-1 border-b border-blue-700/30">
                                  <BookOpen className="w-3 h-3 text-white/90 shrink-0" />
                                  <span className="text-[11px] font-bold text-white truncate max-w-[140px] tracking-tight">
                                    {lesson.lesson_title}
                                  </span>
                                </div>

                                <div className="bg-gradient-to-b from-[#fffdf5] to-[#fff9ec] px-2.5 py-1.5 text-center">
                                  <p className="text-[9px] text-slate-800 font-bold mb-1.5 line-clamp-1 leading-tight">
                                    {lesson.lesson_description ||
                                      "Read sentences and answer comprehension questions!"}
                                  </p>

                                  <Link
                                    href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}
                                  >
                                    <button
                                      type="button"
                                      className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-blue-800 active:scale-95 text-white font-bold text-[10px] tracking-wide shadow-2xs cursor-pointer flex items-center justify-center gap-1 border border-blue-400/60 uppercase transition-all"
                                    >
                                      <BookOpen className="w-3 h-3 fill-white text-white" />
                                      <span>Start Reading</span>
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ── Case C: Locked Node (Stone with Padlock - Clickable to Preview) ── */
                          <div
                            data-node-interactive="true"
                            className="group relative flex flex-col items-center cursor-pointer select-none"
                            onClick={(e) => handleNodeClick(lesson.lesson_id, e)}
                            onMouseEnter={() => handleNodeMouseEnter(lesson.lesson_id)}
                            onMouseLeave={handleNodeMouseLeave}
                            onPointerLeave={handleNodeMouseLeave}
                          >
                            <button
                              type="button"
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 flex items-center justify-center font-bold text-white/80 text-lg sm:text-xl shadow-[0_4px_0_rgba(0,0,0,0.25)] bg-gradient-to-b from-stone-400 to-stone-500 border-stone-300 group-hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              title={`Click to preview "${lesson.lesson_title}"`}
                            >
                              <span>{idx + 1}</span>
                            </button>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900/90 text-white border border-slate-600 flex items-center justify-center shadow-xs pointer-events-none">
                              <Lock className="w-2.5 h-2.5 text-slate-300" />
                            </div>

                            {/* Interactive Locked Preview Card */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={() => handleNodeMouseEnter(lesson.lesson_id)}
                              onMouseLeave={handleNodeMouseLeave}
                              onPointerLeave={handleNodeMouseLeave}
                              className={`absolute ${
                                popDown ? "top-full mt-2" : "bottom-full mb-2"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] bg-slate-900/95 border border-slate-700 rounded-xl p-2 shadow-xl z-50 text-center transition-all duration-200 backdrop-blur-md ${
                                isCardOpen
                                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                                  : "opacity-0 scale-95 pointer-events-none invisible"
                              }`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-slate-700"
                                    : "-bottom-1.5 border-b border-r border-slate-700"
                                } rotate-45`}
                              />
                              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-100 mb-0.5">
                                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[140px]">
                                  {lesson.lesson_title}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-300 font-medium mb-1.5 line-clamp-1">
                                {lesson.lesson_description ||
                                  "Read stories and answer comprehension questions!"}
                              </p>
                              <div className="text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full inline-block border border-amber-400/20">
                                🔒 Trail Locked
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ── Chapter Milestone Badge Pedestal (At top of each chapter zone) ── */}
                  <div
                    data-node-interactive="true"
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 text-center z-20"
                    style={{
                      left: `${milestoneCoord.xPct}%`,
                      top: `${milestoneCoord.yPct}%`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {/* Badge Platform */}
                      <div
                        className={`relative rounded-2xl p-2 sm:p-2.5 flex items-center justify-center transition-all ${
                          isMastered
                            ? "bg-gradient-to-b from-amber-300 via-yellow-300 to-amber-400 ring-4 ring-amber-400/80 shadow-xl"
                            : isLocked
                            ? "bg-gradient-to-b from-slate-300 to-slate-400 grayscale opacity-60 shadow-md"
                            : isAllDone
                            ? "bg-gradient-to-b from-amber-200 via-yellow-200 to-amber-300 ring-4 ring-amber-300 animate-pulse shadow-xl"
                            : "bg-gradient-to-b from-stone-200 via-amber-100/90 to-stone-300 shadow-md"
                        }`}
                      >
                        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center p-1 bg-white/70">
                          <img
                            src={getBadgeAsset(
                              badge.badge_order,
                              badge.badge_type,
                              badge.medal_type,
                              badge.badge_icon_url
                            )}
                            alt={badge.badge_name}
                            className="w-full h-full object-contain filter drop-shadow-md"
                          />
                        </div>

                        {/* Status corner badge */}
                        {isMastered ? (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : isLocked ? (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-700 text-white border-2 border-white flex items-center justify-center shadow-md">
                            <Lock className="w-3 h-3 text-slate-200" />
                          </div>
                        ) : isAllDone ? (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-amber-950 border-2 border-white flex items-center justify-center shadow-md">
                            <Star className="w-3.5 h-3.5 fill-amber-950" />
                          </div>
                        ) : null}
                      </div>

                      {/* Plaque text */}
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-center shadow-md border border-slate-700 backdrop-blur-xs">
                        <p className="text-[10px] font-black tracking-tight leading-tight whitespace-nowrap">
                          {badge.badge_name}
                        </p>
                        <p className="text-[8px] font-bold text-amber-300/90">
                          {isMastered
                            ? "🏆 Mastered!"
                            : isLocked
                            ? "🔒 Locked"
                            : isAllDone
                            ? "⭐ Take Final!"
                            : "Stage Milestone"}
                        </p>
                      </div>

                      {/* Final Mastery Quiz Trigger */}
                      {isAllDone && !isLocked && (
                        <Link
                          href={`/dashboard/quiz?badgeId=${badge.badge_id}&type=final`}
                          className="mt-1"
                        >
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-[10px] shadow-[0_2px_0_#b45309] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 border border-amber-300 uppercase tracking-wide whitespace-nowrap"
                          >
                            <Trophy className="w-3 h-3 fill-amber-950" />
                            <span>{isMastered ? "Retake Final" : "Take Final Quiz"}</span>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Certificate Modal on Stage 5 Mastery */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={studentName}
        section={currentUserSection}
        dateStr={new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      />
    </div>
  );
}
