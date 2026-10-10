"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Lock,
  Star,
  ChevronRight,
  Award,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import { CertificateModal } from "@/components/certificate-modal";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchStudentStats,
  fetchLessonsForStudent,
  fetchStudentLessonProgress,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import type { Badge, StudentBadgeProgress, Lesson } from "@/lib/types";

interface BadgeThemeConfig {
  border: string;
  borderHover: string;
  bg: string;
  titleColor: string;
  descColor: string;
  pillEarned: string;
  pillProgress: string;
  barTrack: string;
  barFill: string;
  statText: string;
  chevron: string;
  xpColor: string;
  shadow: string;
}

function getBadgeTheme(badge: Badge, order: number): BadgeThemeConfig {
  const stage = badge.badge_order || order;
  const name = (badge.badge_name || "").toLowerCase();

  // 1. Reading Star Badge -> Warm Golden Amber / Sun
  if (stage === 1 || badge.badge_type === "star" || name.includes("star")) {
    return {
      border: "border-2 border-amber-400/90",
      borderHover: "hover:border-amber-500",
      bg: "bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-yellow-50/20",
      titleColor: "text-amber-950",
      descColor: "text-amber-900/80",
      pillEarned: "bg-amber-100/90 text-amber-900 border-amber-300/80",
      pillProgress: "bg-amber-100/90 text-amber-900 border-amber-300/80",
      barTrack: "bg-amber-100",
      barFill: "bg-gradient-to-r from-amber-400 to-amber-500",
      statText: "text-amber-900",
      chevron: "text-amber-500 group-hover:text-amber-600",
      xpColor: "text-amber-600",
      shadow: "shadow-xs hover:shadow-md",
    };
  }

  // 2. Reading Ribbon Badge -> Azure River Blue / Sky
  if (stage === 2 || badge.badge_type === "ribbon" || name.includes("ribbon")) {
    return {
      border: "border-2 border-blue-400/90",
      borderHover: "hover:border-blue-500",
      bg: "bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-indigo-50/20",
      titleColor: "text-blue-950",
      descColor: "text-blue-900/80",
      pillEarned: "bg-blue-100/90 text-blue-900 border-blue-300/80",
      pillProgress: "bg-blue-100/90 text-blue-900 border-blue-300/80",
      barTrack: "bg-blue-100",
      barFill: "bg-gradient-to-r from-blue-500 to-indigo-600",
      statText: "text-blue-900",
      chevron: "text-blue-500 group-hover:text-blue-600",
      xpColor: "text-blue-600",
      shadow: "shadow-xs hover:shadow-md",
    };
  }

  // 3. Bronze Medal Badge -> Autumn Copper / Warm Terracotta
  if (stage === 3 || badge.medal_type === "bronze" || name.includes("bronze")) {
    return {
      border: "border-2 border-orange-400/90",
      borderHover: "hover:border-orange-500",
      bg: "bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-stone-50/20",
      titleColor: "text-stone-900",
      descColor: "text-stone-800/80",
      pillEarned: "bg-orange-100/90 text-orange-950 border-orange-300/80",
      pillProgress: "bg-orange-100/90 text-orange-950 border-orange-300/80",
      barTrack: "bg-orange-100",
      barFill: "bg-gradient-to-r from-orange-500 to-amber-600",
      statText: "text-orange-950",
      chevron: "text-orange-500 group-hover:text-orange-600",
      xpColor: "text-orange-600",
      shadow: "shadow-xs hover:shadow-md",
    };
  }

  // 4. Silver Medal Badge -> Frost Silver / Cyan
  if (stage === 4 || badge.medal_type === "silver" || name.includes("silver")) {
    return {
      border: "border-2 border-cyan-400/90",
      borderHover: "hover:border-cyan-500",
      bg: "bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-slate-50/20",
      titleColor: "text-slate-900",
      descColor: "text-slate-800/80",
      pillEarned: "bg-cyan-100/90 text-cyan-950 border-cyan-300/80",
      pillProgress: "bg-cyan-100/90 text-cyan-950 border-cyan-300/80",
      barTrack: "bg-cyan-100",
      barFill: "bg-gradient-to-r from-cyan-500 to-teal-600",
      statText: "text-cyan-950",
      chevron: "text-cyan-500 group-hover:text-cyan-600",
      xpColor: "text-cyan-600",
      shadow: "shadow-xs hover:shadow-md",
    };
  }

  // 5. Gold Medal Badge -> Radiant Celestial Gold
  if (stage === 5 || badge.medal_type === "gold" || name.includes("gold")) {
    return {
      border: "border-2 border-yellow-500/90",
      borderHover: "hover:border-yellow-600",
      bg: "bg-gradient-to-br from-yellow-50/90 via-amber-50/50 to-purple-50/20",
      titleColor: "text-amber-950",
      descColor: "text-amber-900/80",
      pillEarned: "bg-yellow-100/90 text-yellow-950 border-yellow-400/80",
      pillProgress: "bg-yellow-100/90 text-yellow-950 border-yellow-400/80",
      barTrack: "bg-yellow-100",
      barFill: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600",
      statText: "text-amber-950",
      chevron: "text-amber-500 group-hover:text-amber-600",
      xpColor: "text-amber-600",
      shadow: "shadow-xs hover:shadow-md",
    };
  }

  // Fallback for custom badges -> Emerald / Meadow
  return {
    border: "border-2 border-emerald-400/90",
    borderHover: "hover:border-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-green-50/20",
    titleColor: "text-emerald-950",
    descColor: "text-emerald-900/80",
    pillEarned: "bg-emerald-100/90 text-emerald-950 border-emerald-300/80",
    pillProgress: "bg-emerald-100/90 text-emerald-950 border-emerald-300/80",
    barTrack: "bg-emerald-100",
    barFill: "bg-gradient-to-r from-emerald-500 to-teal-600",
    statText: "text-emerald-950",
    chevron: "text-emerald-500 group-hover:text-emerald-600",
    xpColor: "text-emerald-600",
    shadow: "shadow-xs hover:shadow-md",
  };
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [lessonProgress, setLessonProgress] = useState<
    Record<number, { status: "completed" | "in_progress" | "locked"; highest_score: number }>
  >({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LiveStudentStats>({
    full_name: "Pupil",
    section: "Grade 3-A",
    avatar: "🦊",
    totalXp: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    streakDays: 0,
    accuracyRate: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const user = getCurrentUser();
      const studentSection = user?.section || "Grade 3-A";
      const teacherId = user?.teacherId || null;

      const [liveBadges, liveLessons] = await Promise.all([
        fetchBadgesFromSupabase(studentSection, teacherId),
        fetchLessonsForStudent(studentSection, teacherId),
      ]);
      setBadges(liveBadges);
      setAllLessons(liveLessons);

      if (user?.id) {
        const [liveProg, liveLessonProg, liveStats] = await Promise.all([
          fetchStudentBadgeProgress(user.id),
          fetchStudentLessonProgress(user.id),
          fetchStudentStats(user.id, user.fullName, studentSection, user.avatar),
        ]);
        setBadgeProgress(liveProg);
        setLessonProgress(liveLessonProg);
        setStats(liveStats);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const completedBadges = useMemo(() => {
    return badges.filter((b) => {
      const p = badgeProgress.find((prog) => prog.badge_id === b.badge_id);
      return p?.status === "completed";
    });
  }, [badges, badgeProgress]);

  const nextMilestoneXp = stats.totalXp < 500 ? 500 : stats.totalXp < 1000 ? 1000 : 2000;
  const progressToNext = Math.min(100, Math.round((stats.totalXp / nextMilestoneXp) * 100));

  const isStage5Passed = badgeProgress.some(
    (p) => Number(p.badge_id) === 5 && p.status === "completed"
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── 1. Clean Minimal Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Achievements</span>
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {completedBadges.length} / {badges.length} Unlocked
          </span>
        </div>

        {isStage5Passed ? (
          <Button
            onClick={() => setShowCertificate(true)}
            size="sm"
            className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>Star Reader Certificate</span>
          </Button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold"
            title="Complete Stage 5 final quiz to unlock your official Star Reader Certificate"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Certificate Locked (Pass Stage 5)</span>
          </div>
        )}
      </div>

      {/* ── 2. Mastery Rank & XP Overview Card ──────────────────────── */}
      <div className="dashboard-card p-5 sm:p-6 border-2 border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-indigo-50/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Badge Graphic + Current Rank */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-white shadow-sm border border-amber-100 flex-shrink-0">
              <BadgeGraphic
                type={completedBadges.length >= 6 ? "medal" : completedBadges.length >= 3 ? "ribbon" : "star"}
                medalType={completedBadges.length >= 6 ? "gold" : undefined}
                size="md"
                status="completed"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                Reading Mastery Tier
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {completedBadges.length >= 6
                  ? "Master Reader (Medal Tier)"
                  : completedBadges.length >= 3
                  ? "Ribbon Scholar (Tier 2)"
                  : "Star Scholar (Tier 1)"}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500">
                <span className="text-blue-600 font-black">+{stats.totalXp} XP</span>
                <span>•</span>
                <span>{stats.quizzesPassed} Quizzes Passed</span>
                {stats.streakDays > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {stats.streakDays}d Streak
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Milestone Progress Bar */}
          <div className="w-full md:w-64 p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-600">Next Rank Goal</span>
              <span className="text-blue-600">{stats.totalXp} / {nextMilestoneXp} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 block text-right">
              {progressToNext}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Your Badge Adventures Grid (Aligned to Badge Theme like Reference) ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Your Badge Adventures
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Pick a badge to explore its stories. Complete any story at {badges[0]?.required_passing_score || 50}%+ to earn the badge and unlock the next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {badges.map((badge, idx) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";
            const isLocked =
              progress?.status === "locked" ||
              (!progress && badge.badge_id !== 1 && badge.badge_order !== 1);
            const theme = getBadgeTheme(badge, idx + 1);

            const badgeLessons = allLessons.filter((l) => l.badge_id === badge.badge_id);
            const totalStories = badgeLessons.length > 0 ? badgeLessons.length : 3;
            const completedStories = isCompleted
              ? totalStories
              : badgeLessons.filter(
                  (l) => lessonProgress[l.lesson_id]?.status === "completed"
                ).length;

            const completionPercentage = isCompleted
              ? 100
              : progress?.completion_percentage ||
                (totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0);

            const previousBadgeName =
              idx > 0 ? badges[idx - 1]?.badge_name : "previous badge";

            const cardContent = (
              <div
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group h-full ${
                  isLocked
                    ? "bg-slate-50/50 border-2 border-slate-200/80 opacity-70 hover:opacity-85 select-none"
                    : `${theme.bg} ${theme.border} ${theme.borderHover} ${theme.shadow} hover:-translate-y-0.5 cursor-pointer`
                }`}
              >
                <div>
                  {/* Top Row: Badge Graphic + Chevron / Lock */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="p-2 rounded-2xl bg-white/85 backdrop-blur-xs border border-white/70 shadow-xs flex items-center justify-center shrink-0">
                      <BadgeGraphic
                        type={badge.badge_type}
                        medalType={badge.medal_type}
                        badgeIconUrl={badge.badge_icon_url}
                        size="sm"
                        status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                        showStatusBadge={false}
                      />
                    </div>

                    <div>
                      {isLocked ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100/90 border border-slate-200/80 flex items-center justify-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center transition-transform group-hover:translate-x-1 ${theme.chevron}`}
                        >
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Pill Row */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-base sm:text-lg font-black tracking-tight ${
                          isLocked ? "text-slate-500" : theme.titleColor
                        }`}
                      >
                        {badge.badge_name}
                      </h3>

                      {isCompleted ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${theme.pillEarned}`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" /> Earned
                        </span>
                      ) : isInProgress ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${theme.pillProgress}`}
                        >
                          In Progress ({completionPercentage}%)
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                        isLocked ? "text-slate-400" : theme.descColor
                      }`}
                    >
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Locked Banner (Centered lock like Reference Image 2) */}
                {isLocked ? (
                  <div className="my-3 py-2 px-3 rounded-xl bg-white/80 border border-slate-200/80 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 shadow-2xs">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Earn{" "}
                      <span className="font-black text-slate-700">
                        {previousBadgeName}
                      </span>{" "}
                      first
                    </span>
                  </div>
                ) : null}

                {/* Bottom Story Counts & Themed Progress Bar */}
                <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className={isLocked ? "text-slate-400" : theme.statText}>
                      {totalStories} {totalStories === 1 ? "story" : "stories"}
                    </span>
                    <span className={isLocked ? "text-slate-400" : theme.statText}>
                      {completedStories} completed
                    </span>
                  </div>

                  {/* Progress Bar (Exact look from Image 2) */}
                  <div
                    className={`w-full h-2 rounded-full overflow-hidden ${
                      isLocked ? "bg-slate-200/70" : theme.barTrack
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLocked ? "bg-slate-300" : theme.barFill
                      }`}
                      style={{ width: `${isLocked ? 0 : completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );

            if (isLocked) {
              return (
                <div key={badge.badge_id} className="h-full">
                  {cardContent}
                </div>
              );
            }

            return (
              <Link
                key={badge.badge_id}
                href={`/dashboard/badges?stage=${badge.badge_order || badge.badge_id}`}
                className="block h-full focus:outline-none"
                title={`Explore ${badge.badge_name} stories`}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      {badges.length === 0 && (
        <div className="dashboard-card p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No badges found</p>
          <p className="text-xs text-slate-400">
            Complete reading chapters to unlock your achievements!
          </p>
        </div>
      )}

      {/* Star Reader Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={stats.full_name || "Pupil"}
        section={stats.section || "Grade 3-A"}
        autoPlayAudio={true}
      />
    </div>
  );
}

