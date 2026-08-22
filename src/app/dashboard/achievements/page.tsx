"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  ChevronRight,
  Download,
  Star,
  Ribbon,
  Medal,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchStudentStats,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import { getCurrentUser } from "@/utils/auth-helpers";
import type { Badge, StudentBadgeProgress } from "@/lib/types";

export default function AchievementsPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<StudentBadgeProgress[]>([]);
  const [stats, setStats] = useState<LiveStudentStats>({
    full_name: "Pupil",
    section: "Grade 3-A",
    avatar: "🦊",
    totalXp: 100,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    streakDays: 1,
    accuracyRate: 85,
  });

  useEffect(() => {
    async function loadData() {
      const user = getCurrentUser();
      const liveBadges = await fetchBadgesFromSupabase(user?.section || "Grade 3-A");
      setBadges(liveBadges);

      if (user?.id) {
        const [liveProg, liveStats] = await Promise.all([
          fetchStudentBadgeProgress(user.id),
          fetchStudentStats(user.id, user.fullName, user.section, user.avatar),
        ]);
        setBadgeProgress(liveProg);
        setStats(liveStats);
      }
    }
    loadData();
  }, []);

  const starBadges = badges.filter((b) => b.badge_type === "star");
  const ribbonBadges = badges.filter((b) => b.badge_type === "ribbon");
  const medalBadges = badges.filter((b) => b.badge_type === "medal");

  const completedBadges = badges.filter((b) => {
    const p = badgeProgress.find((prog) => prog.badge_id === b.badge_id);
    return p?.status === "completed";
  });

  const nextMilestoneXp = stats.totalXp < 500 ? 500 : stats.totalXp < 1000 ? 1000 : 2000;
  const progressToNext = Math.min(100, Math.round((stats.totalXp / nextMilestoneXp) * 100));

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
            <span className="text-slate-800 font-bold">Achievements</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Reading Credentials &amp; Badge Showcase
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Official reading mastery badges earned at Pedro Victorina Calo Elementary School: Star, Ribbon, and Medal Badges.
          </p>
        </div>

        <Button
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download Certificate
        </Button>
      </div>

      {/* 2. XP & Rank Widget */}
      <div className="dashboard-card p-6 border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BadgeGraphic
              type={completedBadges.length > 3 ? "ribbon" : "star"}
              size="md"
              status="completed"
            />
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Reading Mastery Rank
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {completedBadges.length >= 6
                  ? "Master Reader (Medal Tier)"
                  : completedBadges.length >= 3
                  ? "Ribbon Scholar (Tier 2)"
                  : "Star Scholar (Tier 1)"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {stats.totalXp} XP earned · {completedBadges.length} Badges Conferred
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block">Next Milestone</span>
            <span className="text-sm font-black text-slate-900">Next Rank ({nextMilestoneXp} XP)</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Progress to Next Rank</span>
            <span className="text-blue-600">{stats.totalXp} / {nextMilestoneXp} XP ({progressToNext}%)</span>
          </div>
          <Progress value={progressToNext} className="h-2 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* 3. Star Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              ⭐
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Star Badges (Lesson Mastery Milestones)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {starBadges.length} Star Badges
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {starBadges.map((badge) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";
            const isLocked = progress?.status === "locked" || (!progress && badge.badge_id !== 1);

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-5 flex flex-col justify-between space-y-4 ${
                  isLocked ? "opacity-60 bg-slate-50/50" : "bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.medal_type}
                      size="sm"
                      status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                      showStatusBadge
                    />

                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                    {isInProgress && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        In Progress ({progress?.completion_percentage || 0}%)
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-600">+{badge.xp_reward} XP Reward</span>
                  <span className="font-semibold text-slate-400">Score Req: ≥{badge.required_passing_score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Ribbon Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              🎗️
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ribbon Badges (Cumulative Stage Checkpoints)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {ribbonBadges.length} Ribbon Badges
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ribbonBadges.map((badge) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";
            const isLocked = progress?.status === "locked" || !progress;

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-5 flex flex-col justify-between space-y-4 ${
                  isLocked ? "opacity-60 bg-slate-50/50" : "bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.medal_type}
                      size="sm"
                      status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                      showStatusBadge
                    />

                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                    {isInProgress && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-600">+{badge.xp_reward} XP Reward</span>
                  <span className="font-semibold text-slate-400">Score Req: ≥{badge.required_passing_score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Medal Badges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              🏅
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Medal Badges (Final Mastery Accolades)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {medalBadges.length} Medal Badges
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {medalBadges.map((badge) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isInProgress = progress?.status === "in_progress";
            const isLocked = progress?.status === "locked" || !progress;
            const categoryLabel = getBadgeCategoryLabel(badge.badge_type, badge.medal_type);

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-5 flex flex-col justify-between space-y-4 ${
                  isLocked ? "opacity-60 bg-slate-50/50" : "bg-white"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.medal_type}
                      size="sm"
                      status={isCompleted ? "completed" : isInProgress ? "in_progress" : "locked"}
                      showStatusBadge
                    />

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        badge.medal_type === "bronze"
                          ? "bg-orange-100 text-orange-900 border border-orange-200"
                          : badge.medal_type === "silver"
                          ? "bg-slate-100 text-slate-800 border border-slate-300"
                          : "bg-yellow-100 text-yellow-900 border border-yellow-300"
                      }`}
                    >
                      {categoryLabel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-600">+{badge.xp_reward} XP Reward</span>
                  <span className="font-semibold text-slate-400">Score Req: ≥{badge.required_passing_score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
