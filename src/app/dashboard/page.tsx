"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Trophy,
  FileCheck2,
  Flame,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import {
  fetchBadgesFromSupabase,
  fetchStudentBadgeProgress,
  fetchStudentStats,
  fetchLessonsForStudent,
  type LiveStudentStats,
} from "@/utils/supabase-queries";
import { getCurrentUser, UserProfile } from "@/utils/auth-helpers";
import { DashboardHomeSkeleton } from "@/components/page-skeletons";
import type { Badge, StudentBadgeProgress, Lesson } from "@/lib/types";

export default function StudentDashboard() {
  const [currentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
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
  const [activeStory, setActiveStory] = useState<Lesson | null>(null);

  useEffect(() => {
    const user = getCurrentUser();

    async function loadLiveData() {
      setLoading(true);
      const studentId = user?.id || "";
      const studentName = user?.fullName || "Pupil";
      const studentSection = user?.section || "Grade 3-A";
      const studentAvatar = user?.avatar || "🦊";

      // 1. Fetch real badges from Supabase (scoped to student's enrolled section)
      const liveBadges = await fetchBadgesFromSupabase(studentSection);
      setBadges(liveBadges);

      // 2. Fetch real badge progress for student
      if (studentId) {
        const liveProgress = await fetchStudentBadgeProgress(studentId);
        setBadgeProgress(liveProgress);
      }

      // 3. Fetch real computed stats
      const liveStats = await fetchStudentStats(
        studentId,
        studentName,
        studentSection,
        studentAvatar
      );
      setStats(liveStats);

      // 4. Fetch available lessons for continuing
      const studentLessons = await fetchLessonsForStudent(studentSection);
      if (studentLessons.length > 0) {
        setActiveStory(studentLessons[0]);
      }
      setLoading(false);
    }

    loadLiveData();
  }, []);

  const studentName = currentUser?.fullName || stats.full_name;
  const firstName = studentName.split(" ")[0];

  const currentBadgeProgress =
    badgeProgress.find((p) => p.status === "in_progress") ||
    badgeProgress[0] || { badge_id: 1, status: "in_progress", completion_percentage: 0 };

  const currentBadge =
    badges.find((b) => b.badge_id === currentBadgeProgress.badge_id) || badges[0];

  if (loading) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>ReadSmart</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">My Learning Hub</span>
            <span className="text-slate-300">·</span>
            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200">
              {currentUser?.section || stats.section}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {firstName}! 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Enrolled in <span className="text-blue-700 font-bold">{currentUser?.section || stats.section}</span> · You&apos;re currently earning the <span className="text-blue-700 font-bold">{currentBadge?.badge_name || "Reading Star"}</span>!
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-2xs">
          <Flame className="w-5 h-5 fill-blue-500 text-blue-500" />
          <div>
            <span className="text-sm font-black text-slate-900">{stats.streakDays} Days</span>
            <span className="text-[10px] text-slate-400 font-semibold block leading-none">Reading Streak</span>
          </div>
        </div>
      </div>

      {/* 2. Personal Learning Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            My XP Points
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.totalXp}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">⭐ XP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active Level Progress</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Lessons Read
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.lessonsCompleted}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">📖 Stories</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Stories completed in database</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Quizzes Passed
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{stats.quizzesPassed}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✅ Clear</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{stats.accuracyRate}% Average Accuracy</p>
        </div>

        <div className="dashboard-card p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Badge
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-slate-900 truncate">
              {currentBadge?.badge_name || "Reading Star"}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Level {currentBadge?.badge_order || 1}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{currentBadgeProgress.completion_percentage}% stage progress</p>
        </div>
      </div>

      {/* 3. Active Badge Progress Widget */}
      {currentBadge && (
        <div className="dashboard-card p-6 border-l-4 border-l-blue-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <BadgeGraphic
                type={currentBadge.badge_type}
                medalType={currentBadge.medal_type}
                size="md"
                status="in_progress"
                showStatusBadge
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    Currently Earning · {getBadgeCategoryLabel(currentBadge.badge_type, currentBadge.medal_type)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{currentBadge.badge_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{currentBadge.description}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 inline-block">
                +{currentBadge.xp_reward} XP Reward
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Badge Mastery Progress</span>
              <span className="text-blue-600">{currentBadgeProgress.completion_percentage}% Completed</span>
            </div>
            <Progress value={currentBadgeProgress.completion_percentage} className="h-2.5 bg-slate-100 rounded-full" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href={activeStory ? `/dashboard/lessons?lessonId=${activeStory.lesson_id}` : "/dashboard/badges"}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <PlayCircle className="w-4 h-4" />
              <span>
                {activeStory ? `Continue Journey: "${activeStory.lesson_title}"` : "Open Badge Pathway"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link href="/dashboard/badges" className="text-xs font-semibold text-slate-400 hover:text-slate-700">
              View All Badges →
            </Link>
          </div>
        </div>
      )}

      {/* 4. My Reading Path — 5 Mastery Stages Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Mastery Pathway: 1st Star → 2nd Ribbon → 3rd Bronze → 4th Silver → 5th Gold</span>
          </h3>
          <Link href="/dashboard/badges" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Open Full Pathway
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((badge) => {
            const progress = badgeProgress.find((p) => p.badge_id === badge.badge_id);
            const isCompleted = progress?.status === "completed";
            const isActive = progress?.status === "in_progress";

            return (
              <Link
                key={badge.badge_id}
                href="/dashboard/badges"
                className={`dashboard-card p-4 text-center transition-all flex flex-col items-center justify-between gap-2 hover:shadow-sm ${
                  isActive
                    ? "border-blue-500 bg-white ring-2 ring-blue-500/10"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "bg-slate-50 border-slate-200/80 opacity-60"
                }`}
              >
                <BadgeGraphic
                  type={badge.badge_type}
                  medalType={badge.medal_type}
                  size="sm"
                  status={isCompleted ? "completed" : isActive ? "in_progress" : "locked"}
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {badge.badge_order}. {badge.badge_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {getBadgeCategoryLabel(badge.badge_type, badge.medal_type)}
                  </span>
                </div>

                {isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Mastered
                  </span>
                ) : isActive ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {progress?.completion_percentage || 0}% Progress
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/badges" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Badge Pathway Map</h4>
          <p className="text-xs text-slate-500">Explore all 5 badge stages, 15 unlockable story lessons, and comprehension quizzes.</p>
        </Link>

        <Link href="/dashboard/vocabulary" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Vocabulary Vault</h4>
          <p className="text-xs text-slate-500">Review unlocked vocabulary words, definitions, and contextual example sentences.</p>
        </Link>

        <Link href="/dashboard/achievements" className="dashboard-card p-5 dashboard-card-hover group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">My Achievements</h4>
          <p className="text-xs text-slate-500">View all earned Star, Ribbon, and Medal badges and your reading certificate.</p>
        </Link>
      </div>
    </div>
  );
}
