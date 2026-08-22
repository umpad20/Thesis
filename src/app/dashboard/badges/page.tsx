"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  FileCheck2,
  ChevronRight,
  Star,
  Ribbon,
  Medal,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchBadgeLessonCounts,
  fetchLessonsForStudent,
  fetchStudentLessonProgress,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import type { Badge, StudentBadgeProgress, Lesson } from "@/lib/types";

export default function BadgesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "star" | "ribbon" | "medal">("all");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>
  >({});
  const [expandedBadges, setExpandedBadges] = useState<Record<number, boolean>>({});
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";

      const [liveBadges, liveLessons, counts] = await Promise.all([
        fetchBadgesFromSupabase(studentSection),
        fetchLessonsForStudent(studentSection),
        fetchBadgeLessonCounts(),
      ]);

      setBadges(liveBadges);
      setAllLessons(liveLessons);
      setLessonCounts(counts);

      // Auto-expand all badges by default
      const initialExpanded: Record<number, boolean> = {};
      liveBadges.forEach((b) => {
        initialExpanded[b.badge_id] = true;
      });
      setExpandedBadges(initialExpanded);

      if (user?.id) {
        const [liveProg, liveLessonProg] = await Promise.all([
          fetchStudentBadgeProgress(user.id),
          fetchStudentLessonProgress(user.id),
        ]);
        setBadgeProgress(liveProg);
        setLessonProgress(liveLessonProg);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const toggleExpand = (badgeId: number) => {
    setExpandedBadges((prev) => ({ ...prev, [badgeId]: !prev[badgeId] }));
  };

  const starBadges = badges.filter((b) => b.badge_type === "star");
  const ribbonBadges = badges.filter((b) => b.badge_type === "ribbon");
  const medalBadges = badges.filter((b) => b.badge_type === "medal");

  const completedCount = badgeProgress.filter((p) => p.status === "completed").length;

  const filteredBadges =
    activeTab === "all"
      ? badges
      : badges.filter((b) => b.badge_type === activeTab);

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Badge Pathway</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mastery-Based Badge Progression
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            5 Default Stages: 1st Star → 2nd Ribbon → 3rd Bronze Medal → 4th Silver Medal → 5th Gold Medal
          </p>
        </div>

        {/* Milestone stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
            <span className="text-slate-400">Total Unlocked: </span>
            <span className="text-blue-600 font-bold">
              {completedCount} of {badges.length || 5} Badges
            </span>
          </div>
        </div>
      </div>

      {/* 2. Educational Rule Alert Banner & Mastery Flow */}
      <div className="dashboard-card p-4 bg-blue-50/60 border-blue-200 text-xs text-blue-950 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-2 text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            How Your Learning Journey Works:
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full">
            Sequential Pathway
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">Read the Story Passage</span>
              <span className="text-[10px] text-slate-500">Explore story illustrations, interactive vocabulary, and read aloud.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">Pass the 5-Question Quiz</span>
              <span className="text-[10px] text-slate-500">Score ≥70% on each comprehension quiz to complete the story.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-blue-100">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            <div>
              <span className="font-bold text-slate-800 block text-[11px]">Earn Badges & Unlock Tiers</span>
              <span className="text-[10px] text-slate-500">Finish all 3 lessons in a stage to earn that Badge and unlock the next tier!</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          All Stages ({badges.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("star")}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "star" ? "bg-amber-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Star Badges ({starBadges.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ribbon")}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "ribbon" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Ribbon className="w-3.5 h-3.5" />
          <span>Ribbon Badges ({ribbonBadges.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("medal")}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg transition-all ${
            activeTab === "medal" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Medal className="w-3.5 h-3.5" />
          <span>Medal Badges ({medalBadges.length})</span>
        </button>
      </div>

      {/* 4. Badge Stages List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your Badge Pathway...</div>
      ) : (
        <div className="space-y-5">
          {filteredBadges.map((badge) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";
            const isLocked = progress?.status === "locked" || (!progress && badge.badge_id !== 1);
            const categoryLabel = getBadgeCategoryLabel(badge.badge_type, badge.medal_type);

            const badgeLessons = allLessons.filter((l) => l.badge_id === badge.badge_id);
            const isExpanded = expandedBadges[badge.badge_id] !== false;

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card transition-all overflow-hidden ${
                  isInProgress
                    ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm bg-white"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "bg-slate-50/70 border-slate-200/70 opacity-80"
                }`}
              >
                {/* Badge Header Card */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Badge Graphic & Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <BadgeGraphic
                        type={badge.badge_type}
                        medalType={badge.medal_type}
                        size="md"
                        status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                        showStatusBadge
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-1">
                          <h3 className="text-base font-bold text-slate-900">
                            {badge.badge_order}. {badge.badge_name}
                          </h3>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              badge.badge_type === "star"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : badge.badge_type === "ribbon"
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : badge.medal_type === "bronze"
                                ? "bg-orange-100 text-orange-900 border border-orange-200"
                                : badge.medal_type === "silver"
                                ? "bg-slate-100 text-slate-800 border border-slate-300"
                                : "bg-yellow-100 text-yellow-900 border border-yellow-300"
                            }`}
                          >
                            {categoryLabel}
                          </span>

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Mastered
                            </span>
                          )}
                          {isInProgress && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                              Active Stage ({progress?.completion_percentage || 0}%)
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                              Locked Stage
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {badge.description}
                        </p>

                        {/* Stage Requirements Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{badgeLessons.length || 3} Story Lessons</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Passing Score: ≥{badge.required_passing_score}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Reward: +{badge.xp_reward} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Progress & Toggle */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 min-w-[180px]">
                      {isInProgress && (
                        <div className="w-full space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-500">Stage Progress</span>
                            <span className="text-blue-600">
                              {progress?.completion_percentage || 0}%
                            </span>
                          </div>
                          <Progress
                            value={progress?.completion_percentage || 0}
                            className="h-2 bg-slate-100 rounded-full"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(badge.badge_id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
                      >
                        <span>{isExpanded ? "Hide Story Lessons" : "View Story Lessons"}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nested 3 Story Lessons for this Badge */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-200/80 p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                      <span className="uppercase tracking-wider text-[10px] text-slate-400">
                        Stories in this Badge ({badgeLessons.length} Lessons)
                      </span>
                      <span>Pass each comprehension quiz to complete the stage</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {badgeLessons.map((lesson, idx) => {
                        const lessonProg = lessonProgress[lesson.lesson_id];
                        const isLessonCompleted = lessonProg?.status === "completed";

                        // Lesson unlock rule:
                        // 1. Lesson 1 is always unlocked.
                        // 2. Lesson N is unlocked if Lesson N-1 is completed.
                        // 3. Or if previous badge is completed and this is lesson 1 of next badge.
                        let isLessonUnlocked = false;
                        if (lesson.lesson_id === 1) {
                          isLessonUnlocked = true;
                        } else {
                          const prevLessonId = lesson.lesson_id - 1;
                          const prevLessonProg = lessonProgress[prevLessonId];
                          isLessonUnlocked = Boolean(prevLessonProg?.status === "completed" || isLessonCompleted);
                        }

                        return (
                          <div
                            key={lesson.lesson_id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                              isLessonCompleted
                                ? "bg-white border-emerald-200 shadow-2xs"
                                : isLessonUnlocked
                                ? "bg-white border-blue-300 shadow-xs ring-1 ring-blue-500/10"
                                : "bg-slate-100/70 border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  Lesson {idx + 1}
                                </span>
                                {isLessonCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Score: {lessonProg?.highest_score || 100}%
                                  </span>
                                ) : isLessonUnlocked ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                                    Ready to Read
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                    <Lock className="w-2.5 h-2.5" /> Locked
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {lesson.lesson_title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                                  {lesson.lesson_description}
                                </p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-3 border-t border-slate-100 mt-3">
                              {isLessonUnlocked ? (
                                <Link
                                  href={`/dashboard/lessons?lessonId=${lesson.lesson_id}`}
                                  className="w-full block"
                                >
                                  <Button
                                    size="sm"
                                    className={`w-full h-8 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 ${
                                      isLessonCompleted
                                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{isLessonCompleted ? "Re-read Story" : "Read Story"}</span>
                                    <ArrowRight className="w-3 h-3 ml-0.5" />
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  disabled
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs font-medium rounded-lg text-slate-400 bg-slate-100/50 border-slate-200"
                                >
                                  <Lock className="w-3 h-3 mr-1" /> Locked
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
