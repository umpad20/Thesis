"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
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
import { NodeStarBadge, StarRatingRow } from "@/components/quiz-stars";
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

// Road percentage coordinates within each climate stage (supports both desktop landscape and mobile portrait)
function getLessonCoords(idx: number, totalInChapter: number, order: number = 1) {
  if (order === 5) {
    if (totalInChapter <= 3) {
      if (idx === 0) return { d: { xPct: 36, yPct: 77 }, m: { xPct: 35, yPct: 84 } };
      if (idx === 1) return { d: { xPct: 60.5, yPct: 56.5 }, m: { xPct: 52, yPct: 60 } };
      return { d: { xPct: 78, yPct: 38 }, m: { xPct: 68, yPct: 44 } };
    }
    if (idx === 0) return { d: { xPct: 30, yPct: 80 }, m: { xPct: 35, yPct: 84 } };
    if (idx === 1) return { d: { xPct: 42, yPct: 73 }, m: { xPct: 50, yPct: 68 } };
    if (idx === 2) return { d: { xPct: 60.5, yPct: 56.5 }, m: { xPct: 62, yPct: 52 } };
    return { d: { xPct: 78, yPct: 38 }, m: { xPct: 72, yPct: 36 } };
  }

  if (order === 4) {
    if (totalInChapter <= 3) {
      if (idx === 0) return { d: { xPct: 35, yPct: 82 }, m: { xPct: 48, yPct: 80 } };
      if (idx === 1) return { d: { xPct: 57, yPct: 60.5 }, m: { xPct: 53, yPct: 61.5 } };
      return { d: { xPct: 81, yPct: 43 }, m: { xPct: 66, yPct: 42 } };
    }
    if (idx === 0) return { d: { xPct: 28, yPct: 83 }, m: { xPct: 52, yPct: 85 } };
    if (idx === 1) return { d: { xPct: 42, yPct: 75 }, m: { xPct: 38, yPct: 72 } };
    if (idx === 2) return { d: { xPct: 57, yPct: 60.5 }, m: { xPct: 53, yPct: 61.5 } };
    return { d: { xPct: 81, yPct: 40 }, m: { xPct: 72, yPct: 38 } };
  }

  if (order === 3) {
    if (totalInChapter <= 3) {
      if (idx === 0) return { d: { xPct: 34, yPct: 75 }, m: { xPct: 56, yPct: 77 } };
      if (idx === 1) return { d: { xPct: 69, yPct: 53 }, m: { xPct: 56, yPct: 49 } };
      return { d: { xPct: 81, yPct: 36 }, m: { xPct: 77, yPct: 35 } };
    }
    if (idx === 0) return { d: { xPct: 25, yPct: 82 }, m: { xPct: 62, yPct: 82 } };
    if (idx === 1) return { d: { xPct: 45, yPct: 70 }, m: { xPct: 36, yPct: 68 } };
    if (idx === 2) return { d: { xPct: 70, yPct: 52 }, m: { xPct: 56, yPct: 49 } };
    return { d: { xPct: 82, yPct: 35 }, m: { xPct: 77, yPct: 35 } };
  }

  if (order === 2) {
    if (totalInChapter <= 3) {
      if (idx === 0) return { d: { xPct: 56, yPct: 75 }, m: { xPct: 35, yPct: 81 } };
      if (idx === 1) return { d: { xPct: 40, yPct: 42 }, m: { xPct: 36, yPct: 43 } };
      return { d: { xPct: 53, yPct: 24 }, m: { xPct: 63, yPct: 26 } };
    }
    if (idx === 0) return { d: { xPct: 47, yPct: 83 }, m: { xPct: 30, yPct: 84 } };
    if (idx === 1) return { d: { xPct: 60, yPct: 67 }, m: { xPct: 62, yPct: 66 } };
    if (idx === 2) return { d: { xPct: 41, yPct: 41 }, m: { xPct: 36, yPct: 43 } };
    return { d: { xPct: 53, yPct: 23 }, m: { xPct: 63, yPct: 26 } };
  }

  if (order === 1) {
    if (totalInChapter <= 3) {
      if (idx === 0) return { d: { xPct: 35, yPct: 72 }, m: { xPct: 28, yPct: 81 } };
      if (idx === 1) return { d: { xPct: 68, yPct: 46 }, m: { xPct: 81, yPct: 58 } };
      return { d: { xPct: 45, yPct: 26 }, m: { xPct: 30, yPct: 38 } };
    }
    if (idx === 0) return { d: { xPct: 40, yPct: 75 }, m: { xPct: 28, yPct: 82 } };
    if (idx === 1) return { d: { xPct: 46, yPct: 58 }, m: { xPct: 65, yPct: 68 } };
    if (idx === 2) return { d: { xPct: 71, yPct: 44 }, m: { xPct: 72, yPct: 48 } };
    return { d: { xPct: 45, yPct: 26 }, m: { xPct: 30, yPct: 38 } };
  }

  if (totalInChapter <= 3) {
    if (idx === 0) return { d: { xPct: 42, yPct: 78 }, m: { xPct: 36, yPct: 78 } };
    if (idx === 1) return { d: { xPct: 60, yPct: 60 }, m: { xPct: 68, yPct: 60 } };
    return { d: { xPct: 42, yPct: 40 }, m: { xPct: 34, yPct: 40 } };
  }
  if (idx === 0) return { d: { xPct: 42, yPct: 80 }, m: { xPct: 36, yPct: 80 } };
  if (idx === 1) return { d: { xPct: 60, yPct: 64 }, m: { xPct: 68, yPct: 64 } };
  if (idx === 2) return { d: { xPct: 42, yPct: 44 }, m: { xPct: 34, yPct: 44 } };
  return { d: { xPct: 58, yPct: 26 }, m: { xPct: 64, yPct: 26 } };
}

// Milestone Pedestal coordinate at top of chapter
function getMilestoneCoord(order: number) {
  if (order === 5) return { d: { xPct: 83.3, yPct: 15 }, m: { xPct: 76, yPct: 25 } };
  if (order === 4) return { d: { xPct: 87.5, yPct: 23 }, m: { xPct: 76, yPct: 28 } };
  if (order === 3) return { d: { xPct: 88, yPct: 20 }, m: { xPct: 82, yPct: 22 } };
  if (order === 2) return { d: { xPct: 46, yPct: 12 }, m: { xPct: 43, yPct: 11 } };
  if (order === 1) return { d: { xPct: 62, yPct: 14 }, m: { xPct: 37, yPct: 12 } };
  return { d: { xPct: 52, yPct: 16 }, m: { xPct: 52, yPct: 15 } };
}

// Separate mobile portrait and desktop landscape assets
function getClimateAssetUrls(order: number) {
  const climateImgOrder = order <= 5 ? order : ((order - 1) % 5) + 1;
  if (climateImgOrder === 5) {
    return {
      mobile: "/images/climates/climate_stage_5_mobile.png",
      desktop: "/images/climates/climate_stage_5_desktop.jpg",
    };
  }
  if (climateImgOrder === 4) {
    return {
      mobile: "/images/climates/climate_stage_4_mobile.png",
      desktop: "/images/climates/climate_stage_4_desktop.jpg",
    };
  }
  if (climateImgOrder === 3) {
    return {
      mobile: "/images/climates/climate_stage_3_mobile.png",
      desktop: "/images/climates/climate_stage_3_desktop.jpg",
    };
  }
  if (climateImgOrder === 2) {
    return {
      mobile: "/images/climates/climate_stage_2_mobile.png",
      desktop: "/images/climates/climate_stage_2_desktop.jpg",
    };
  }
  if (climateImgOrder === 1) {
    return {
      mobile: "/images/climates/climate_stage_1_mobile.png",
      desktop: "/images/climates/climate_stage_1_desktop.jpg",
    };
  }
  return {
    mobile: `/images/climates/climate_stage_${climateImgOrder}.jpg`,
    desktop: `/images/climates/climate_stage_${climateImgOrder}.jpg`,
  };
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

      {/* ── 2. Responsive Map Viewport (.map-viewport) ─────────── */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="map-viewport relative w-full flex-1 min-h-0 overflow-hidden select-none bg-white flex items-center justify-center gap-3 sm:gap-4 lg:gap-5 p-2 sm:p-3 lg:p-4 pb-20 md:pb-4"
      >
        {/* ── Desktop Left-Hand Info Cards: Positioned OUTSIDE the map on the left, aligned to top ── */}
        <div className="hidden lg:flex flex-col gap-2.5 z-30 pointer-events-auto w-48 shrink-0 select-none self-start pt-3">
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

        {/* Responsive Map Container: Expands to full remaining desktop width and height */}
        <div
          className="relative h-full max-h-full flex-1 min-w-0 w-full max-w-sm sm:max-w-md md:max-w-none aspect-[9/16] md:aspect-auto flex items-center justify-center transition-all duration-300"
        >
          {/* Single-Chapter Map Canvas (Bordered and overflow-hidden to keep map artwork & clouds strictly inside) */}
          <div className="relative w-full h-full border border-slate-300/80 bg-white overflow-hidden shadow-lg rounded-2xl">
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
            const climateUrls = getClimateAssetUrls(order);
            const milestoneCoord = getMilestoneCoord(order);

            return (
              <div
                key={`chapter-section-${badge.badge_id}`}
                ref={(el) => {
                  chapterRefs.current[order] = el;
                }}
                className="relative w-full h-full select-none overflow-hidden"
              >
                {/* Photorealistic Climate Stage Background Artwork: Mobile portrait & Desktop landscape */}
                <img
                  src={climateUrls.mobile}
                  alt={`Climate Biome ${order}: ${climate.name}`}
                  className="md:hidden absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />
                <img
                  src={climateUrls.desktop}
                  alt={`Climate Biome ${order}: ${climate.name}`}
                  className="hidden md:block absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
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

                    const coord = getLessonCoords(idx, chLessons.length, order);

                    // Pop down for higher nodes, pop up for lower nodes
                    const popDown = coord.d.yPct < 45;
                    const lessonScore =
                      typeof prog?.highest_score === "number" && prog.highest_score > 0
                        ? prog.highest_score
                        : 100;

                    return (
                      <div
                        key={lesson.lesson_id}
                        data-node-interactive="true"
                        className="storybook-node absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 hover:z-50"
                        style={
                          {
                            "--x-m": `${coord.m.xPct}%`,
                            "--y-m": `${coord.m.yPct}%`,
                            "--x-d": `${coord.d.xPct}%`,
                            "--y-d": `${coord.d.yPct}%`,
                          } as React.CSSProperties
                        }
                      >
                        {/* ── Case A: Completed Node (Golden Yellow Stepping Stone matching map road) ── */}
                        {isDone ? (
                          <div className="group relative flex flex-col items-center">
                            {/* Stepping Stone: Click automatically opens the book */}
                            <Link
                              href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}
                              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-3 sm:border-4 border-yellow-100 shadow-[0_5px_0_#b45309,0_8px_16px_rgba(180,83,9,0.35)] flex items-center justify-center font-black text-amber-950 text-lg sm:text-xl group-hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                              title={`Lesson ${idx + 1}: ${lesson.lesson_title} (Click to open story)`}
                            >
                              <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">{idx + 1}</span>

                              {/* Completion Checkmark Badge */}
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow-xs pointer-events-none">
                                <Check className="w-3 h-3 stroke-[3.5]" />
                              </div>

                              {/* 3-Star Rating Badge (Score-dependent: 3 for 100%, 1.5 for 50%, etc.) */}
                              <NodeStarBadge score={lessonScore} />
                            </Link>

                            {/* Interactive Action Card (Re-read & Retake) shown on hover */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute ${
                                popDown
                                  ? "top-full mt-2 before:absolute before:inset-x-0 before:-top-3 before:h-3"
                                  : "bottom-full mb-2 before:absolute before:inset-x-0 before:-bottom-3 before:h-3"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] bg-[#fffdf8] border border-amber-300/90 rounded-xl p-2 shadow-xl z-50 text-center transition-all duration-200 opacity-0 scale-95 pointer-events-none invisible group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:visible`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#fffdf8] ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-amber-300"
                                    : "-bottom-1.5 border-b border-r border-amber-300"
                                } rotate-45 pointer-events-none`}
                              />

                              {/* Story Title & Score */}
                              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-900 mb-0.5">
                                <BookOpen className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[140px] leading-tight">
                                  {lesson.lesson_title}
                                </span>
                              </div>
                              <div className="flex flex-col items-center gap-1 mb-1.5">
                                <div className="text-[9px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Mastered · Score: {lessonScore}%</span>
                                </div>
                                <StarRatingRow score={lessonScore} size="w-3 h-3" showLabel={true} />
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
                        ) : isCurrentActive || isUnlocked ? (
                          /* ── Case B: Active Node (Prominently Highlighted Current Level) ── */
                          <div className="group relative flex flex-col items-center z-25">
                            {/* "Current Level" Floating Badge Tag */}
                            <div className="absolute -top-4 sm:-top-5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md border border-slate-700 flex items-center gap-1 whitespace-nowrap z-30 animate-bounce pointer-events-none">
                              <Navigation className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>Current Level</span>
                            </div>

                            {/* Stepping Stone: Click automatically opens the book */}
                            <Link
                              href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}
                              className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 border-4 border-blue-200 shadow-[0_0_35px_rgba(37,99,235,0.9),0_6px_0_#1e3a8a] flex items-center justify-center font-black text-white text-lg sm:text-xl animate-pulse group-hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
                              title={`Current Level: ${lesson.lesson_title} (Click to open story)`}
                            >
                              <span>{idx + 1}</span>
                            </Link>

                            {/* Floating Parchment Quest Pop-up Card on Hover */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute ${
                                popDown
                                  ? "top-full mt-2 before:absolute before:inset-x-0 before:-top-3 before:h-3"
                                  : "bottom-full mb-2 before:absolute before:inset-x-0 before:-bottom-3 before:h-3"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] z-40 transition-all duration-200 opacity-0 scale-95 pointer-events-none invisible group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:visible`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-blue-700"
                                    : "-bottom-1.5 border-b border-r border-blue-700"
                                } rotate-45 z-10 pointer-events-none`}
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
                          /* ── Case C: Locked Node (Stone with Padlock) ── */
                          <div
                            className="group relative flex flex-col items-center cursor-not-allowed select-none"
                          >
                            <button
                              type="button"
                              disabled
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 flex items-center justify-center font-bold text-white/80 text-lg sm:text-xl shadow-[0_4px_0_rgba(0,0,0,0.25)] bg-gradient-to-b from-stone-400 to-stone-500 border-stone-300 transition-all cursor-not-allowed opacity-80"
                              title={`Locked: ${lesson.lesson_title}`}
                            >
                              <span>{idx + 1}</span>
                            </button>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900/90 text-white border border-slate-600 flex items-center justify-center shadow-xs pointer-events-none">
                              <Lock className="w-2.5 h-2.5 text-slate-300" />
                            </div>

                            {/* Interactive Locked Preview Card on Hover */}
                            <div
                              data-node-interactive="true"
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute ${
                                popDown
                                  ? "top-full mt-2 before:absolute before:inset-x-0 before:-top-3 before:h-3"
                                  : "bottom-full mb-2 before:absolute before:inset-x-0 before:-bottom-3 before:h-3"
                              } left-1/2 -translate-x-1/2 w-44 sm:w-48 max-w-[190px] bg-slate-900/95 border border-slate-700 rounded-xl p-2 shadow-xl z-50 text-center transition-all duration-200 backdrop-blur-md opacity-0 scale-95 pointer-events-none invisible group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-hover:visible`}
                            >
                              {/* Pointer Beak */}
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 ${
                                  popDown
                                    ? "-top-1.5 border-t border-l border-slate-700"
                                    : "-bottom-1.5 border-b border-r border-slate-700"
                                } rotate-45 pointer-events-none`}
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
                    className="storybook-milestone absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 text-center z-20"
                    style={
                      {
                        "--mx-m": `${milestoneCoord.m.xPct}%`,
                        "--my-m": `${milestoneCoord.m.yPct}%`,
                        "--mx-d": `${milestoneCoord.d.xPct}%`,
                        "--my-d": `${milestoneCoord.d.yPct}%`,
                      } as React.CSSProperties
                    }
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

        {/* ── Desktop Right-Hand Navigation Column: Outside the map leaving dedicated space ── */}
        <div className="hidden lg:flex flex-col justify-between items-center py-4 h-full shrink-0 z-30 pointer-events-auto w-14 select-none">
          {/* Travel to Next Chapter (Top) */}
          {hasNextChapter && nextBadge ? (
            <button
              type="button"
              onClick={() => triggerCloudTransition(activeChapterOrder + 1, "bottom")}
              title={`Travel to Chapter ${nextBadge.badge_order}: ${nextBadge.badge_name}`}
              className="group flex flex-col items-center gap-1 cursor-pointer select-none transition-transform active:scale-90"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl flex items-center justify-center border-2 border-white transition-all group-hover:scale-110 animate-bounce">
                <ArrowUp className="w-5 h-5 stroke-[2.8]" />
              </div>
              <span className="text-[11px] font-black text-slate-700 tracking-tight whitespace-nowrap drop-shadow-xs bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                Ch. {nextBadge.badge_order}
              </span>
            </button>
          ) : (
            <div />
          )}

          {/* Return to Previous Chapter (Bottom) */}
          {hasPrevChapter && prevBadge ? (
            <button
              type="button"
              onClick={() => triggerCloudTransition(activeChapterOrder - 1, "top")}
              title={`Return to Chapter ${prevBadge.badge_order}: ${prevBadge.badge_name}`}
              className="group flex flex-col items-center gap-1 cursor-pointer select-none transition-transform active:scale-90"
            >
              <span className="text-[11px] font-black text-slate-700 tracking-tight whitespace-nowrap drop-shadow-xs bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                Ch. {prevBadge.badge_order}
              </span>
              <div className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl flex items-center justify-center border-2 border-white transition-all group-hover:scale-110 animate-bounce">
                <ArrowDown className="w-5 h-5 stroke-[2.8]" />
              </div>
            </button>
          ) : (
            <div />
          )}
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
