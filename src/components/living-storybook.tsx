"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Flame,
  Award,
  Star,
  ChevronRight,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorybookSeal } from "@/components/storybook-seal";
import type { Badge, Lesson, StudentBadgeProgress } from "@/lib/types";

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

export function LivingStorybook({
  badges,
  allLessons,
  badgeProgress,
  lessonProgress = {},
  totalXp = 350,
  streakDays = 5,
}: LivingStorybookProps) {
  // Find currently active badge stage
  const activeBadgeId =
    badgeProgress.find((p) => p.status === "in_progress")?.badge_id || 1;

  // Selected stage tab inside the storybook
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(activeBadgeId);
  const [isPageTurning, setIsPageTurning] = useState(false);

  const handleSealSelect = (badgeId: number) => {
    if (badgeId === selectedBadgeId) return;
    setIsPageTurning(true);
    setTimeout(() => {
      setSelectedBadgeId(badgeId);
      setTimeout(() => {
        setIsPageTurning(false);
      }, 450);
    }, 120);
  };

  // Selected badge data
  const currentBadge =
    badges.find((b) => b.badge_id === selectedBadgeId) ||
    badges[0] || {
      badge_id: 1,
      badge_name: "Story Starter",
      badge_type: "star",
      description: "Begin your reading adventure with foundational stories.",
      required_passing_score: 70,
      xp_reward: 100,
      badge_order: 1,
    };

  // Lessons belonging to the selected badge
  const chapterLessons = allLessons.filter(
    (l) => l.badge_id === currentBadge.badge_id
  );

  // Overall completed count for mastery calculation
  const completedBadgesCount = badgeProgress.filter(
    (p) => p.status === "completed"
  ).length;

  const totalCompletedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === "completed"
  ).length;

  // Vitality percentage of the living story world (0 - 100%)
  const storyVitality = Math.min(
    100,
    Math.round(
      (completedBadgesCount * 20) +
        ((totalCompletedLessons % 3) * 6.6)
    )
  );

  // Find next unfinished lesson for the Hero CTA button
  const currentActiveLesson =
    chapterLessons.find((l) => lessonProgress[l.lesson_id]?.status !== "completed") ||
    chapterLessons[0] || {
      lesson_id: 1,
      lesson_title: "The New Classmate",
      lesson_description: "A heartwarming story about welcoming new friends in school.",
    };

  return (
    <div className="w-full space-y-6">
      {/* ── 1. Top Storybook Header & Student Journey Stats ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">The Living Storybook</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>The Living Storybook</span>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Grade 6 Reading Journey
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Read stories, pass quizzes, and watch your magical story world come to life!
          </p>
        </div>

        {/* Gamified Rewards Chips */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{totalXp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-900 shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
            <span>{streakDays} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedBadgesCount} / 5 Seals</span>
          </div>
        </div>
      </div>

      {/* ── 2. The Main Interactive Living Storybook Canvas ───────────────── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-blue-900 via-slate-900 to-indigo-950 p-3 sm:p-6 shadow-2xl border-4 border-amber-900/30 overflow-hidden">
        {/* Ambient Magical Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
          <div className="absolute bottom-16 left-1/3 w-2 h-2 rounded-full bg-purple-300 animate-bounce" />
          <div className="absolute top-1/2 right-1/6 w-1 h-1 rounded-full bg-yellow-200 animate-ping" />
        </div>

        {/* Open Book Outer Binding Frame */}
        <div className="relative bg-[#fffdfa] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-amber-100/80 flex flex-col overflow-hidden">
          {/* Double-Page Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-amber-200/70 min-h-[460px]">
            
            {/* ── LEFT PAGE: The Living World Illustration ────────────────── */}
            <div className="p-6 sm:p-8 flex flex-col justify-between relative bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30">
              {/* Page Number & Chapter Subtitle */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-blue-900/80">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Story Realm</span>
                </span>
                <span>Page {currentBadge.badge_order * 2 - 1}</span>
              </div>

              {/* Magical Story Illustration Scene */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-amber-200/80 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 shadow-inner flex items-center justify-center p-4">
                {/* Sun / Sky Light */}
                <div
                  className={`absolute top-4 right-6 w-14 h-14 rounded-full transition-all duration-700 ${
                    storyVitality >= 20
                      ? "bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_0_24px_rgba(250,204,21,0.8)] scale-100 opacity-100"
                      : "bg-slate-300 opacity-40 scale-75"
                  }`}
                />

                {/* Animated Clouds */}
                <div className="absolute top-6 left-6 flex items-center gap-1 opacity-75">
                  <div className="w-10 h-4 bg-white/90 rounded-full shadow-xs" />
                  <div className="w-6 h-6 bg-white/90 rounded-full -ml-3 -mt-2 shadow-xs" />
                </div>

                {/* Floating Story Sparks */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-12 left-1/3 text-amber-400 animate-pulse text-xs">✨</div>
                  <div className="absolute top-20 right-1/3 text-blue-400 animate-bounce text-xs">🌟</div>
                  <div className="absolute bottom-24 left-1/4 text-purple-400 animate-pulse text-xs">📖</div>
                </div>

                {/* SVG Landscape Elements */}
                <svg
                  viewBox="0 0 400 240"
                  className="w-full h-full object-contain overflow-visible"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Mountains */}
                  <polygon
                    points="40,190 120,90 200,190"
                    fill={storyVitality >= 40 ? "#93C5FD" : "#CBD5E1"}
                    opacity="0.85"
                  />
                  <polygon
                    points="140,190 240,70 340,190"
                    fill={storyVitality >= 60 ? "#818CF8" : "#94A3B8"}
                    opacity="0.7"
                  />
                  <polygon
                    points="260,190 320,110 380,190"
                    fill={storyVitality >= 40 ? "#A5B4FC" : "#CBD5E1"}
                    opacity="0.8"
                  />

                  {/* Rolling Green Hills */}
                  <path
                    d="M-20,200 Q80,140 200,180 T420,170 L420,240 L-20,240 Z"
                    fill={storyVitality >= 20 ? "#4ADE80" : "#94A3B8"}
                    opacity={storyVitality >= 20 ? "0.95" : "0.5"}
                  />
                  <path
                    d="M-20,215 Q100,170 220,195 T420,190 L420,240 L-20,240 Z"
                    fill={storyVitality >= 20 ? "#22C55E" : "#64748B"}
                  />

                  {/* Cozy Story Cottage / Library */}
                  <g transform="translate(180, 115)">
                    {/* Cottage Roof */}
                    <polygon
                      points="40,25 0,55 80,55"
                      fill={storyVitality >= 60 ? "#EA580C" : "#64748B"}
                      stroke="#431407"
                      strokeWidth="1.5"
                    />
                    {/* Cottage Base */}
                    <rect
                      x="10"
                      y="55"
                      width="60"
                      height="45"
                      fill={storyVitality >= 60 ? "#FEF3C7" : "#CBD5E1"}
                      stroke="#78350F"
                      strokeWidth="1.5"
                      rx="2"
                    />
                    {/* Door */}
                    <rect
                      x="32"
                      y="70"
                      width="16"
                      height="30"
                      fill={storyVitality >= 60 ? "#9A3412" : "#475569"}
                      rx="8"
                    />
                    {/* Glowing Window */}
                    <circle
                      cx="55"
                      cy="72"
                      r="6"
                      fill={storyVitality >= 60 ? "#FDE047" : "#94A3B8"}
                      stroke="#78350F"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Great Magic Tree of Knowledge */}
                  <g transform="translate(45, 80)">
                    {/* Tree Trunk */}
                    <path
                      d="M45,120 C45,90 55,70 50,55 C45,70 35,90 35,120 Z"
                      fill="#78350F"
                    />
                    {/* Blooming Tree Canopy */}
                    <circle
                      cx="45"
                      cy="45"
                      r="35"
                      fill={storyVitality >= 20 ? "#16A34A" : "#64748B"}
                      opacity="0.95"
                    />
                    <circle
                      cx="25"
                      cy="40"
                      r="22"
                      fill={storyVitality >= 20 ? "#22C55E" : "#94A3B8"}
                    />
                    <circle
                      cx="65"
                      cy="40"
                      r="22"
                      fill={storyVitality >= 20 ? "#15803D" : "#475569"}
                    />
                    {/* Golden Fruit / Books on Tree */}
                    {storyVitality >= 40 && (
                      <>
                        <circle cx="35" cy="30" r="4" fill="#FACC15" />
                        <circle cx="55" cy="35" r="4" fill="#FACC15" />
                        <circle cx="45" cy="55" r="4" fill="#FACC15" />
                      </>
                    )}
                  </g>

                  {/* Mascot Character (Reading Fox) */}
                  <g transform="translate(130, 160)">
                    {/* Fox Body */}
                    <ellipse cx="25" cy="28" rx="14" ry="16" fill="#EA580C" />
                    {/* Fox Head & Ears */}
                    <circle cx="25" cy="14" r="11" fill="#EA580C" />
                    <polygon points="17,8 14,0 21,5" fill="#C2410C" />
                    <polygon points="33,8 36,0 29,5" fill="#C2410C" />
                    {/* White Face Mask */}
                    <polygon points="20,18 25,24 30,18" fill="#FFFFFF" />
                    <circle cx="25" cy="22" r="1.5" fill="#0F172A" />
                    {/* Fox Reading Book */}
                    <rect
                      x="16"
                      y="26"
                      width="18"
                      height="12"
                      fill="#2563EB"
                      rx="2"
                    />
                    <line
                      x1="25"
                      y1="26"
                      x2="25"
                      y2="38"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                </svg>

                {/* Faded / Sketch Overlay when not completed */}
                {storyVitality < 100 && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-slate-900/5 backdrop-contrast-125"
                    style={{ opacity: (100 - storyVitality) / 120 }}
                  />
                )}
              </div>

              {/* Storybook Transformation Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800">
                    Story World Vitality:
                  </span>
                  <span className="font-black text-blue-600">
                    {storyVitality}% Alive
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {completedBadgesCount} / 5 Stages Mastered
                </span>
              </div>
            </div>

            {/* ── RIGHT PAGE: Active Chapter & Quest Action ───────────────── */}
            <div
              className={`p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-bl from-white via-amber-50/20 to-white transition-all duration-300 ${
                isPageTurning ? "page-turn-forward" : ""
              }`}
            >
              <div>
                {/* Page Number & Chapter Header */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span className="text-blue-600 font-bold uppercase tracking-wider text-[11px]">
                    Chapter {currentBadge.badge_order} · {currentBadge.badge_name}
                  </span>
                  <span>Page {currentBadge.badge_order * 2}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {currentBadge.badge_name}
                </h2>

                {/* ── Hero Next Quest Card ───────────────────────────────── */}
                {(() => {
                  const allStoriesDone =
                    chapterLessons.length > 0 &&
                    chapterLessons.every(
                      (l) => lessonProgress[l.lesson_id]?.status === "completed"
                    );
                  const isStageBadgeMastered =
                    badgeProgress.find((p) => p.badge_id === currentBadge.badge_id)
                      ?.status === "completed";

                  return (
                    <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

                      <div className="flex items-center gap-2 text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {isStageBadgeMastered
                            ? "Stage Mastered"
                            : allStoriesDone
                            ? "Stage Final Assessment Ready"
                            : "Current Active Quest"}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white mb-1.5">
                        {isStageBadgeMastered
                          ? `${currentBadge.badge_name} · Seal Mastered!`
                          : allStoriesDone
                          ? `${currentBadge.badge_name} · Stage Final Quiz`
                          : currentActiveLesson.lesson_title || "The New Classmate"}
                      </h3>
                      <p className="text-xs text-blue-100 leading-relaxed mb-4 line-clamp-2">
                        {isStageBadgeMastered
                          ? "You have conquered all stories and earned this Achievement Seal! You can freely re-read any chapter or retake quizzes to improve your rank."
                          : allStoriesDone
                          ? "You have completed all 3 stories! Take the Stage Final Evaluation to earn your Achievement Seal and unlock the next stage!"
                          : currentActiveLesson.lesson_description ||
                            "Read through the story passage and take the comprehension quiz to advance."}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {allStoriesDone && !isStageBadgeMastered ? (
                          <Link
                            href={`/dashboard/quiz?badgeId=${currentBadge.badge_id}&type=final`}
                            className="inline-block w-full sm:w-auto"
                          >
                            <Button
                              size="default"
                              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition-all duration-200 animate-bounce"
                            >
                              <Award className="w-4 h-4 text-amber-900" />
                              <span>Take Stage Final Quiz ⭐</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/lessons?lessonId=${currentActiveLesson.lesson_id}`}
                            className="inline-block w-full sm:w-auto"
                          >
                            <Button
                              size="default"
                              className="w-full sm:w-auto h-10 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition-all duration-200"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>{isStageBadgeMastered ? "Re-read Chapters" : "Continue Story"}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Chapter Stepping Stones (3 Stories) ────────────────── */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Chapter Stories ({chapterLessons.length || 3})
                  </span>

                  <div className="space-y-2">
                    {chapterLessons.map((lesson, idx) => {
                      const prog = lessonProgress[lesson.lesson_id];
                      const isDone = prog?.status === "completed";

                      // Robust sequential story unlocking rule
                      let isUnlocked = false;
                      if (isDone) {
                        isUnlocked = true;
                      } else if (idx === 0) {
                        if (currentBadge.badge_order === 1) {
                          isUnlocked = true;
                        } else {
                          const prevBadgeProg = badgeProgress.find(
                            (p) => p.badge_id === currentBadge.badge_order - 1
                          );
                          isUnlocked = Boolean(
                            prevBadgeProg?.status === "completed" ||
                              (prevBadgeProg?.completion_percentage || 0) >= 100
                          );
                        }
                      } else {
                        const prevLesson = chapterLessons[idx - 1];
                        const prevProg = prevLesson
                          ? lessonProgress[prevLesson.lesson_id]
                          : null;
                        isUnlocked = Boolean(prevProg?.status === "completed");
                      }

                      return (
                        <div
                          key={lesson.lesson_id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isDone
                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                              : isUnlocked
                              ? "bg-white border-blue-200 shadow-2xs text-slate-900"
                              : "bg-slate-50 border-slate-200/70 text-slate-400 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-xs font-bold block leading-tight">
                                {lesson.lesson_title}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {isDone
                                  ? `Score: ${prog?.highest_score || 100}%`
                                  : isUnlocked
                                  ? "Ready to read"
                                  : "Locked"}
                              </span>
                            </div>
                          </div>

                          {isDone ? (
                            <div className="flex items-center gap-1.5">
                              <Link href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                                >
                                  Re-read
                                </Button>
                              </Link>
                              <Link href={`/dashboard/quiz?lessonId=${lesson.lesson_id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  Retake
                                </Button>
                              </Link>
                            </div>
                          ) : isUnlocked ? (
                            <Link
                              href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}
                            >
                              <Button
                                size="sm"
                                className="h-7 px-3.5 text-[11px] font-black rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              >
                                Read Story
                              </Button>
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Stage Final Mastery Assessment Milestone ────────────── */}
                {(() => {
                  const allStoriesDone =
                    chapterLessons.length > 0 &&
                    chapterLessons.every(
                      (l) => lessonProgress[l.lesson_id]?.status === "completed"
                    );
                  const isStageBadgeMastered =
                    badgeProgress.find((p) => p.badge_id === currentBadge.badge_id)
                      ?.status === "completed";

                  return (
                    <div
                      className={`mt-4 p-3.5 rounded-2xl border transition-all ${
                        isStageBadgeMastered
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                          : allStoriesDone
                          ? "bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-300 ring-2 ring-amber-400/20 shadow-sm"
                          : "bg-slate-50/80 border-slate-200/80 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isStageBadgeMastered
                                ? "bg-emerald-600 text-white"
                                : allStoriesDone
                                ? "bg-amber-500 text-white animate-bounce"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black block text-slate-900 leading-tight">
                              {currentBadge.badge_name} Stage Final Assessment
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isStageBadgeMastered
                                ? "🏆 Stage Mastered! Seal Earned."
                                : allStoriesDone
                                ? "🌟 Ready! Score ≥75% to earn Seal & unlock Next Chapter."
                                : "🔒 Locked (Complete all 3 stories first)"}
                            </span>
                          </div>
                        </div>

                        {allStoriesDone ? (
                          <Link
                            href={`/dashboard/quiz?badgeId=${currentBadge.badge_id}&type=final`}
                          >
                            <Button
                              size="sm"
                              className={`h-8 px-3.5 text-xs font-black rounded-xl shadow-sm ${
                                isStageBadgeMastered
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950"
                              }`}
                            >
                              <span>{isStageBadgeMastered ? "Retake Final" : "Take Final Quiz"}</span>
                            </Button>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Milestone XP Reward Footer */}
              <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Passing Grade: ≥{currentBadge.required_passing_score}%</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>+{currentBadge.xp_reward} XP Reward</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── 3. Magical Seals Tray (The 5 Badge Progression Seals) ───── */}
          <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border-t-2 border-amber-200/80 p-4 sm:p-5">
            <div className="text-center mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-900/80">
                ✨ Collect All 5 Magical Achievement Seals ✨
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto items-center">
              {badges.slice(0, 5).map((badge) => {
                const prog = badgeProgress.find((p) => p.badge_id === badge.badge_id);
                const isCompleted = prog?.status === "completed";
                const isInProg =
                  prog?.status === "in_progress" ||
                  (!prog && badge.badge_id === 1);

                return (
                  <StorybookSeal
                    key={badge.badge_id}
                    stageNumber={badge.badge_order}
                    name={badge.badge_name}
                    type={badge.badge_type}
                    medalType={badge.medal_type}
                    status={
                      isCompleted
                        ? "completed"
                        : isInProg
                        ? "in_progress"
                        : "locked"
                    }
                    isSelected={selectedBadgeId === badge.badge_id}
                    onClick={() => handleSealSelect(badge.badge_id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
